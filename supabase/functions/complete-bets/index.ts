import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface reqPayload {
    game_id: string;
    final_score: number;
}

interface LiveBet {
    id: string;
    game_id: string;
    poster: string;
    acceptor: string;
    points: number;
    side: 'over' | 'under';
    a_money: number;
    p_money: number;
    winner: string | null;
}

async function processBet(bet: LiveBet, final_score: number): Promise<void> {
    let winner: string;
    let winnings: number;

    if ((bet.points > final_score && bet.side === 'over') || 
        (bet.points < final_score && bet.side === 'under')) {
        winner = bet.poster;
        winnings = bet.a_money;
    } else {
        winner = bet.acceptor;
        winnings = bet.p_money;
    }

    console.log(`info: updating bet ${bet.id}...`)
    const { error: updateError } = await supabase
        .from('live_bets')
        .update({ winner })
        .eq('id', bet.id);
    if (updateError) {
        console.error('Error updating bet:', updateError);
        throw updateError;
    }
    
    console.log(`info: getting user ${winner} current balance by`);
    const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', winner)
        .single();
    if (fetchError) {
        console.error('error: Error fetching user balance:', fetchError);
        throw fetchError;
    }
    const newBalance = userData.balance + winnings;

    console.log(`info: updating user balance from ${userData.balance} to ${newBalance}`);
    const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', winner);
    if (balanceError) {
        console.error('error: Error updating user balance:', balanceError);
        throw balanceError;
    }
}

async function completeGameBets(game_id: string, final_score: number): Promise<void> {
    try {
        console.log(`info: retrieving all live bets with game_id: ${game_id}...`)
        const { data: liveBets, error: fetchError } = await supabase
            .from('live_bets')
            .select('*')
            .eq('game_id', game_id)
            .is('winner', null);
        if (fetchError) {
            console.error('error: Error fetching live bets:', fetchError);
            throw fetchError;
        }

        console.log(`info: processing all live bets...`)
        for (const bet of liveBets) {
            await processBet(bet, final_score);
        }
    } catch (error) {
        console.error('error: Error completing game bets:', error);
        throw error;
    }
}

// Main handler function
console.log("server started");
serve(async (req: Request) => {
    try {
        const { game_id, final_score }: reqPayload = await req.json();
        if (game_id === undefined || final_score === undefined) {
            throw new Error('error: game_id and final_score are required');
        }

        await completeGameBets(game_id, final_score);
        
        return new Response(JSON.stringify({
            success: true,
            message: `Successfully processed all bets for game ${game_id}`,
            timestamp: new Date().toISOString()
        }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });
    } catch (error: any) {
        console.error('error: Error in complete_bets function:', error);
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
