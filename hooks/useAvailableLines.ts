import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AvailableLine {
  id: string;
  game_id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  point: number; 
  price: number;
  outcome_name: string;
}

export function useAvailableLines() {
  const [lines, setLines] = useState<AvailableLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadAvailableLines();

    // Subscribe to changes in available_lines table
    const linesSubscription = supabase
      .channel('available_lines_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'available_lines',
      }, () => {
        console.log('Available lines change detected, reloading lines');
        loadAvailableLines();
      })
      .subscribe();

    return () => {
      linesSubscription.unsubscribe();
    };
  }, []);

  const loadAvailableLines = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('available_lines')
        .select('*')
        .order('commence_time', { ascending: true });

      console.log('Loaded available lines:', data); // Log the loaded data for debugging
      if (error) throw error;

      setLines(data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading available lines:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const getLinesBySport = async (sportKey: string) => {
    try {
      const { data, error } = await supabase
        .from('available_lines')
        .select('*')
        .eq('sport_key', sportKey)
        .order('commence_time', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error loading lines by sport:', err);
      throw err;
    }
  };

  return {
    lines,
    loading,
    error,
    getLinesBySport,
    refreshLines: loadAvailableLines,
  };
} 