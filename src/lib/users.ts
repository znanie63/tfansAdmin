import { supabase } from './supabase';
import { User } from '@/types';

interface UserRecord {
  id: string;
  user_id: string;
  username: string;
  photo_url: string;
  created_at: string,
  balance?: number;
  total_spent?: number;
}

function transformUserFromDB(record: UserRecord): User {
  return {
    id: record.user_id,
    username: record.username,
    avatar: record.photo_url,
    joinedAt: new Date(record.created_at),
    balance: record.balance || 0,
    totalSpent: record.total_spent || 0
  };
}

export async function getUsers(): Promise<User[]> {
  // Get users with their balance transactions
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('user_id, username, photo_url, created_at')
    .order('created_at', { ascending: false });

  if (usersError) throw usersError;

  // Get all balance transactions
  const { data: transactions, error: txError } = await supabase
    .from('balance')
    .select('user_id, amount, type');

  if (txError) throw txError;

  // Calculate balance and spending for each user
  const usersWithBalance = users.map(user => {
    const userTransactions = transactions.filter(tx => tx.user_id === user.user_id);
    const balance = userTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalSpent = userTransactions
      .filter(tx => tx.type === 'token_deduction')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    return {
      ...user,
      balance,
      total_spent: totalSpent
    };
  });

  return usersWithBalance.map(record => transformUserFromDB(record as UserRecord));
}