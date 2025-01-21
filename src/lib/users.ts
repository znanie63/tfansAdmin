import { supabase } from './supabase';
import { User } from '@/types';

interface UserRecord {
  id: string;
  username: string;
  photo_url: string;
  created_at: string;
}

function transformUserFromDB(record: UserRecord): User {
  return {
    id: record.id,
    username: record.username,
    avatar: record.photo_url,
    joinedAt: new Date(record.created_at)
  };
}

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }

  return (data || []).map(record => transformUserFromDB(record as UserRecord));
}