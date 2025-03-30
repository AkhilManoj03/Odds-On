import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ActivityIndicatorComponent } from 'react-native';

interface Bet {
  id: string;
  player: string;
  points: number;
  odds: number;
  coefficients: number[];
}

interface LiveBet {
  id: string;
  name: string;
  points: number;
  odds: number;
  p_money: number;
  a_money: number;
  poster: string;
  poster_email: string;
  acceptor: string;
  acceptor_email: string;
  winner: string | null;
  winner_email: string | null;
  side: 'OVR' | 'UND';
}

export function useBets() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useBets hook initialized');
    loadBets();

    // Subscribe to changes in bets table
    const betsSubscription = supabase
      .channel('bets_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'public_bets',
      }, () => {
        console.log('Bets change detected, reloading bets');
        loadBets();
      })
      .subscribe();

    return () => {
      betsSubscription.unsubscribe();
    };
  }, []);

  const loadBets = async () => {
    try {
      console.log('Starting to load bets...');
      setLoading(true);
      const { data: betsData, error } = await supabase
        .from('public_bets')
        .select('*');
      
      console.log('Supabase response:', { data: betsData, error });

      if (error) {
        console.error('Error loading bets:', error);
        setError(error.message);
        return;
      }

      console.log('Bets loaded successfully:', betsData);
      setBets(betsData || []);
    } catch (err) {
      console.error('Exception while loading bets:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    bets,
    loading,
    error,
    loadBets,
  };
}

export async function getBetById(betId: string) {
  try {
    console.log(`Fetching bet with ID: ${betId}`);
    const { data, error } = await supabase
      .from('public_bets')
      .select('*')
      .eq('id', betId)
      .single(); // Fetch a single bet by ID

    if (error) {
      console.error('Error fetching bet:', error);
      throw error;
    }

    console.log('Fetched bet data:', data);
    return data; // Return the fetched bet data
  } catch (error) {
    console.error('Error in getBetById:', error);
    throw error;
  }
}

export function useLiveBets() {
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useLiveBets hook initialized');
    loadLiveBets();

    // Subscribe to changes in live_bets table
    const liveBetsSubscription = supabase
      .channel('live_bets_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_bets',
      }, () => {
        console.log('Live bets change detected, reloading live bets');
        loadLiveBets();
      })
      .subscribe();

    return () => {
      liveBetsSubscription.unsubscribe();
    };
  }, []);

  const loadLiveBets = async () => {
    try {
      console.log('Starting to load live bets...');
      setLoading(true);
      
      // First, get all live bets
      const { data: liveBetsData, error: liveBetsError } = await supabase
        .from('live_bets')
        .select('*');

      if (liveBetsError) {
        console.error('Error loading live bets:', liveBetsError);
        setError(liveBetsError.message);
        return;
      }

      // Get unique poster IDs
      const posterIds = [...new Set(liveBetsData?.map(bet => bet.poster) || [])];
      
      // Fetch user emails for all posters
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email')
        .in('id', posterIds);

      if (usersError) {
        console.error('Error loading user emails:', usersError);
        setError(usersError.message);
        return;
      }

      // Create a map of user IDs to emails
      const userEmailMap = new Map(usersData?.map(user => [user.id, user.email]) || []);

      // Combine the data
      const enrichedLiveBets = liveBetsData?.map(bet => ({
        ...bet,
        poster_email: userEmailMap.get(bet.poster) || 'Unknown User',
        acceptor_email: userEmailMap.get(bet.acceptor) || 'Unknown User',
        winner_email: userEmailMap.get(bet.winner) || 'Unknown User',
      })) || [];
        

      console.log('Live bets loaded successfully:', enrichedLiveBets);
      setLiveBets(enrichedLiveBets);
    } catch (err) {
      console.error('Exception while loading live bets:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    liveBets,
    loading,
    error,
    loadLiveBets,
  };
}
export async function updateLiveBet(betId: string, userId: string | undefined) {
  try {
    // Update the acceptor in the live bet to the provided userId
    console.log('Updating live bet with ID:', betId, 'to acceptor:', userId);
    const { error: updateAcceptorError } = await supabase
      .from('live_bets')
      .update({ acceptor: userId }) // Update the acceptor field
      .eq('id', betId); // Match the bet by ID

    if (updateAcceptorError) throw updateAcceptorError;

    // Fetch the current live bet
    const { data: liveBet, error: betError } = await supabase
      .from('live_bets')
      .select('acceptor, p_money, odds')
      .eq('id', betId)
      .single();

    console.log('Fetched live bet:', liveBet);
    if (betError) throw betError;

    const acceptorId = liveBet.acceptor;
    const p_money = liveBet.p_money;
    const odds = liveBet.odds;

    const a_money = odds >= 0 ? Math.round(((p_money) * ((odds) / 100)) * 100) / 100 : Math.round(((p_money) / ((odds) / -100)) * 100) / 100; 


    // Fetch the acceptor's current balance
    const { data: acceptorData, error: balanceError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', acceptorId)
      .single();
    
    console.log('Fetched acceptor data:', acceptorData);

    if (balanceError) throw balanceError;

    // Calculate the new balance
    const newBalance = acceptorData.balance - a_money;
    console.log('New balance:', newBalance);

    // Update the live bet with a_money
    const { error: updateBetError } = await supabase
      .from('live_bets')
      .update({ a_money }) // Update the a_money field
      .eq('id', betId); // Match the bet by ID

    if (updateBetError) throw updateBetError;

    // Update the acceptor's balance
    const { error: updateBalanceError } = await supabase
      .from('users')
      .update({ balance: newBalance }) // Update the acceptor's balance
      .eq('id', acceptorId); // Match the acceptor by ID

    if (updateBalanceError) throw updateBalanceError;

    console.log('Live bet updated successfully and acceptor balance adjusted');
  } catch (error) {
    console.error('Error updating live bet:', error);
  }
}
export async function postBet(name: string, points: number, odds: number, side: 'OVR' | 'UND', p_money: number, userId: string) {
  try {
    // Insert the new bet into the live_bets table

    odds = -1 * odds; // flip odds for the live bet

    const { error: insertError } = await supabase
      .from('live_bets')
      .insert([
        {
          name,
          points,
          odds,
          side,
          p_money,
          poster: userId,
          acceptor: null, // Initially, there is no acceptor
        },
      ]);

    if (insertError) throw insertError;

    // Fetch the current balance of the user
    const { data: userData, error: balanceError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (balanceError) throw balanceError;

    const newBalance = userData.balance - p_money;

    // Update the user's balance
    const { error: updateBalanceError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (updateBalanceError) throw updateBalanceError;

    console.log('Bet posted successfully and balance updated');
  } catch (error) {
    console.error('Error posting bet:', error);
  }
}
