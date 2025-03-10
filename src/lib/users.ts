import { supabase } from './supabase';
import { User } from '@/types';

export interface UserRecord {
  id: string;
  user_id: string;
  username: string;
  photo_url: string;
  created_at: string,
}

function transformUserFromDB(record: UserRecord): User {
  return {
    id: record.user_id,
    username: record.username,
    avatar: record.photo_url,
    joinedAt: new Date(record.created_at)
  };
}

export async function getUsers(page: number = 1, limit: number = 20): Promise<{
  users: User[],
  hasMore: boolean
  stats: {
    totalUsers: number,
    totalBalance: number,
    totalSpent: number
  }
}> {
  // Get users with their balance transactions
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('user_id, username, photo_url, created_at')
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false });

  if (usersError) throw usersError;

  // Get total count to determine if there are more users
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  // Get all balance transactions for stats
  const { data: transactions, error: txError } = await supabase
    .from('balance')
    .select('amount, type');

  if (txError) throw txError;

  // Calculate total stats
  const totalBalance = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
  const totalSpent = transactions
    ?.filter(tx => tx.type === 'token_deduction')
    ?.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;

  return {
    users: users.map(record => transformUserFromDB(record as UserRecord)),
    hasMore: count ? (page * limit) < count : false,
    stats: {
      totalUsers: count || 0,
      totalBalance,
      totalSpent
    }
  };
}