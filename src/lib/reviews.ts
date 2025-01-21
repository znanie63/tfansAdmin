import { supabase } from './supabase';
import { Review } from '@/types';

interface ReviewRecord {
  id: string;
  user_id: string;
  text: string;
  rating: number;
  created_at: string;
  updated_at: string;
  auth: {
    users: {
      username: string;
      photo_url: string;
    }
  };
}


function transformReviewFromDB(record: ReviewRecord): Review {
  return {
    id: record.id,
    userId: record.user_id,
    username: record.auth.users.username,
    avatar: record.auth.users.photo_url,
    text: record.text,
    rating: record.rating,
    createdAt: new Date(record.created_at),
  };
}


export async function getReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:users (
        username,
        photo_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    throw new Error('Failed to fetch reviews');
  }

  return (data || []).map(record => ({
    id: record.id,
    userId: record.user_id,
    username: record.user.username,
    avatar: record.user.photo_url,
    text: record.text,
    rating: record.rating,
    createdAt: new Date(record.created_at)
  }));

  if (error) {
    console.error('Error fetching reviews:', error);
    throw new Error('Failed to fetch reviews');
  }

  return (data || []).map(record => transformReviewFromDB(record as ReviewRecord));
}