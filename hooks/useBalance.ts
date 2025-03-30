import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  balance: number;
}

export function useBalance() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalance();

    // Subscribe to changes in users table
    const balanceSubscription = supabase
      .channel('balance_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users',
      }, () => {
        console.log('User change detected, reloading balance');
        loadBalance();
      })
      .subscribe();

    return () => {
      balanceSubscription.unsubscribe();
    };
  }, []);

  const loadBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userData, error } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setBalance(userData?.balance || 0);
    } catch (error) {
      console.error('Error loading balance:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    balance,
    loading,
  };
} 