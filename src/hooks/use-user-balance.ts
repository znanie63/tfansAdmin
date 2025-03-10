import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UserBalance {
  balance: number;
  totalSpent: number;
  loading: boolean;
  error: string | null;
}

export function useUserBalance(userId: string): UserBalance {
  const [balance, setBalance] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: transactions, error: txError } = await supabase
          .from('balance')
          .select('amount, type')
          .eq('user_id', userId);

        if (txError) throw txError;

        // Calculate balance from all transactions
        const currentBalance = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

        // Calculate total spent from token deductions
        const spent = transactions
          ?.filter(tx => tx.type === 'token_deduction')
          ?.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;

        setBalance(currentBalance);
        setTotalSpent(spent);
      } catch (err) {
        console.error('Error loading user balance:', err);
        setError('Failed to load balance data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadBalance();
    }
  }, [userId]);

  return { balance, totalSpent, loading, error };
}