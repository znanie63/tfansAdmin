import { Chat, Message, Model, User } from '@/types';

interface ChatRecord {
  id: string;
  user_id: string;
  model_id: string;
  created_at: string;
  updated_at: string;
  models: {
    first_name: string;
    last_name: string;
    nickname: string;
    profile_image_path: string;
    chat_link: string;
  };
  users: {
    username: string;
    photo_url: string;
  };
  messages: MessageRecord[];
}

interface MessageRecord {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image';
  image_url: string | null;
  is_from_user: boolean;
  is_admin: boolean;
  created_at: string;
}

export function transformChatFromDB(record: ChatRecord): Chat {
  return {
    id: record.id,
    type: record.type || 'regular',
    user: {
      id: record.user_id,
      username: record.users.username,
      avatar: record.users.photo_url,
      joinedAt: new Date(),
    },
    model: {
      id: record.model_id,
      firstName: record.models.first_name,
      lastName: record.models.last_name,
      nickname: record.models.nickname,
      profileImage: record.models.profile_image_path,
      chatLink: record.models.chat_link,
    } as Model, // Type assertion since we don't need all Model fields
    lastMessage: '',
    lastMessageAt: new Date(record.updated_at),
    messages: [],
  };
}

export function transformMessageFromDB(record: MessageRecord): Message {
  return {
    id: record.id,
    isFromUser: record.is_from_user,
    text: record.message_type === 'text' ? record.content : undefined,
    image: record.message_type === 'image' ? record.image_url || undefined : undefined,
    timestamp: new Date(record.created_at),
  };
}