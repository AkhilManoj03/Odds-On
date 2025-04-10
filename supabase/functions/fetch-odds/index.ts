import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import axios from 'https://esm.sh/axios';
// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);
// Function to save games to Supabase
async function saveGamesToSupabase(games) {
  // Delete ALL existing entries from the available_lines table
  console.log('Deleting all existing entries from available_lines table...');
  const { error: deleteError } = await supabase
    .from('available_lines')
    .delete()
    .neq('game_id', 'dummy'); // This will match all rows
  
  if (deleteError) {
    console.error('Error deleting existing entries:', deleteError);
    throw deleteError;
  }
  
  console.log('Successfully deleted all existing entries');

  const linesToInsert = games.flatMap((game) =>
    game.bookmakers.flatMap((bookmaker) =>
      bookmaker.markets.flatMap((market) =>
        market.outcomes.map((outcome) => ({
          game_id: game.id,
          sport_key: game.sport_key,
          sport_title: game.sport_title,
          commence_time: game.commence_time,
          home_team: game.home_team,
          away_team: game.away_team,
          bookmaker_key: bookmaker.key,
          bookmaker_title: bookmaker.title,
          market_key: market.key,
          outcome_name: outcome.name,
          price: outcome.price,
          point: outcome.point,
          last_update: new Date().toISOString()
        }))
      )
    )
  );

  // Process in batches of 100
  console.log(`Inserting ${linesToInsert.length} new betting lines...`);
  for (let i = 0; i < linesToInsert.length; i += 100) {
    const batch = linesToInsert.slice(i, i + 100);
    const { error } = await supabase
      .from('available_lines')
      .insert(batch); // Changed from upsert to insert since we're deleting first

    if (error) {
      console.error('Error saving batch:', error);
      throw error;
    }
  }

  console.log(`Successfully saved ${linesToInsert.length} betting lines`);
}
// Function to fetch games from the odds API
async function getUpcomingGames(sportKey = 'basketball_nba') {
  try {
    const endOfDay = new Date();
    endOfDay.setDate(endOfDay.getDate() + 1);
    endOfDay.setHours(3, 59, 59);
    const endOfDayISO = endOfDay.toISOString().split('.')[0] + 'Z';
    const apiKey = Deno.env.get('ODDS_API_KEY') || '';
    const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds`, {
      params: {
        apiKey,
        regions: 'us',
        markets: 'totals',
        oddsFormat: 'american',
        dateFormat: 'iso',
        commenceTimeTo: endOfDayISO
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
}
// Main handler function
console.log("server started");
serve(async (req)=>{
  // Verify the request is authorized
  try {
    // Fetch games from the API
    const games = await getUpcomingGames();
    // Save games to Supabase
    await saveGamesToSupabase(games);
    return new Response(JSON.stringify({
      success: true,
      message: `Successfully processed ${games.length} games`,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error in fetch-odds function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
