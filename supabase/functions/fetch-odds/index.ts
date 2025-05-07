import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import axios from 'https://esm.sh/axios';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define types for the API response
interface Outcome {
  name: string;
  price: number;
  point?: number;
}

interface Market {
  key: string;
  outcomes: Outcome[];
}

interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

interface Game {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

// Function to fetch today's NBA games to map team names to game IDs
async function fetchTodaysNbaGames(): Promise<any[]> {
  const url = "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json"
  try {
    const response = await axios.get(url);
    const gameDates = response.data['leagueSchedule']['gameDates'];
    
    // Get today's date in MM/DD/YYYY format
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const todayFormatted = `${mm}/${dd}/${yyyy} 00:00:00`;

    // Find the entry for today's date and return its games array
    const todaysGames = gameDates.find((dateEntry: any) => dateEntry.gameDate === todayFormatted);
    if (!todaysGames || todaysGames.length < 1) {
      console.log("error: no games found, please investigate")
      return []
    }

    for (const game of todaysGames.games) {
      const { error } = await supabase
          .from('todays_games')
          .insert({
              game_id: game.gameId,
              status: game.gameStatus
          });

      if (error) {
          console.error('error: could not insert games:', error);
      }
    }
    return todaysGames.games;
  } catch (error) {
    console.error("error: could not fetching today's NBA games:", error);
    return [];
  }
}

// Function to save games to Supabase
async function saveGamesToSupabase(games: Game[]): Promise<void> {

  // Fetch today's NBA games to map team names to game IDs
  const todaysGames = await fetchTodaysNbaGames();
  const linesToInsert = games.flatMap((game: Game) =>
    game.bookmakers.flatMap((bookmaker: Bookmaker) =>
      bookmaker.markets.flatMap((market: Market) =>
        market.outcomes.map((outcome: Outcome) => {
          // Find the matching game from the NBA API
          const matchingGame = todaysGames.find(
            (nbaGame: any) =>
              game.home_team.includes(nbaGame['homeTeam']['teamName']) &&
              game.away_team.includes(nbaGame['awayTeam']['teamName'])
          );

          // Use the NBA game ID if a match is found, otherwise use the original game ID
          const game_id = matchingGame ? matchingGame['gameId'] : game.id;

          return {
            game_id: game_id,
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
          };
        })
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
async function getUpcomingGames(sportKey = 'basketball_nba'): Promise<Game[]> {
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
serve(async (req: Request) => {
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
  } catch (error: any) {
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
