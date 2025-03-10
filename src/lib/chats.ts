import { supabase } from './supabase';
import { Chat, Message } from '@/types';
import { transformChatFromDB, transformMessageFromDB } from './transformers';
import type { ChatRecord, MessageRecord } from './transformers';

export async function getChats(page: number = 1, limit: number = 20): Promise<{
  chats: Omit<Chat, 'messages'>[],
  hasMore: boolean
}> {
  const { data: chats, error } = await supabase
    .from('chats')
    .select(`
      *,
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
    `)
    .range((page - 1) * limit, page * limit - 1)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chats:', error);
    throw new Error('Failed to fetch chats');
  }

  // Get total count to determine if there are more chats
  const { count } = await supabase
    .from('chats')
    .select('*', { count: 'exact', head: true });

  const transformedChats = (chats as ChatRecord[]).map(chat => ({
    id: chat.id,
    type: 'regular',
    user: {
      id: chat.user_id,
      username: chat.users.username,
      avatar: chat.users.photo_url,
      joinedAt: new Date(),
    },
    model: {
      id: chat.model_id,
      firstName: chat.models.first_name,
      lastName: chat.models.last_name,
      nickname: chat.models.nickname,
      profileImage: chat.models.profile_image_path,
      chatLink: chat.models.chat_link,
    },
    lastMessage: '',
    lastMessageAt: new Date(chat.updated_at),
  }));

  return {
    chats: transformedChats,
    hasMore: count ? (page * limit) < count : false
  };
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to fetch messages');
  }

  return (messages as MessageRecord[])
    .map(transformMessageFromDB)
    .reverse();
}

export async function sendMessage(chatId: string, data: { 
  content: string;
  messageType: 'text' | 'image';
  imageUrl?: string;
  userId?: string;
  isFromUser?: boolean;
  isAdmin?: boolean;
}): Promise<Message> {
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      user_id: data.userId,
      content: data.content,
      message_type: data.messageType,
      image_url: data.imageUrl,
      is_from_user: data.isFromUser ?? true,
      is_admin: data.isAdmin ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }

  // Update chat's updated_at timestamp
  await supabase
    .from('chats')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId);

  return transformMessageFromDB(message as MessageRecord);
}

export async function uploadChatImage(file: File): Promise<string> {
  if (!file) throw new Error('No file provided');

  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `chat-images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('models')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error('Failed to upload image');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('models')
    .getPublicUrl(filePath);

  return publicUrl;
}