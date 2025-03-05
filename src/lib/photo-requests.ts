import { supabase } from './supabase';
import { PhotoRequest } from '@/types';
import { transformChatFromDB } from './transformers';

interface PhotoRequestRecord {
  id: string;
  chat_id: string;
  user_id: string;
  status: string;
  chance: number;
  photo_url: string | null;
  message: string;
  created_at: string;
}

function transformPhotoRequestFromDB(record: PhotoRequestRecord): PhotoRequest {
  return {
    id: record.id,
    chatId: record.chat_id,
    userId: record.user_id,
    status: record.status as PhotoRequestStatus,
    chance: record.chance,
    photoUrl: record.photo_url || undefined,
    message: record.message,
    createdAt: new Date(record.created_at),
  };
}

export async function getPhotoRequests(includeCompleted: boolean = false): Promise<PhotoRequest[]> {
  const { data, error } = await supabase
    .from('photo_requests')
    .select(`
      *,
      chat:chats (
        models (
          first_name,
          last_name,
          nickname,
          profile_image_path,
          chat_link
        ),
        users (
          username,
          photo_url
        )
      )
    `)
    .not('status', 'eq', includeCompleted ? null : 'closed')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching photo requests:', error);
    throw new Error('Failed to fetch photo requests');
  }

  return data.map(record => ({
    ...transformPhotoRequestFromDB(record),
    chat: record.chat ? transformChatFromDB(record.chat) : undefined
  }));
}

export async function updatePhotoRequestStatus(
  id: string, 
  status: PhotoRequestStatus
): Promise<void> {
  const { error } = await supabase
    .from('photo_requests')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating photo request:', error);
    throw new Error('Failed to update photo request');
  }
}