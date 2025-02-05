import { supabase } from './supabase';
import { Chat, Message } from '@/types';
import { transformChatFromDB, transformMessageFromDB } from './transformers';
import type { ChatRecord, MessageRecord } from './transformers';

export async function getChats(): Promise<Chat[]> {
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
      ),
      messages (
        id,
        chat_id,
        user_id,
        content,
        message_type,
        image_url,
        is_from_user,
        is_admin,
        created_at
      ) {
        order: created_at
      }
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chats:', error);
    throw new Error('Failed to fetch chats');
  }

  return (chats as ChatRecord[]).map(transformChatFromDB);
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to fetch messages');
  }

  return (messages as MessageRecord[]).map(transformMessageFromDB);
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