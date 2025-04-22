export type PhotoRequestStatus = 'found' | 'not_found' | 'cancel' | 'completed';

export type VideoRequestStatus = 'found' | 'not_found' | 'cancel' | 'completed';

export interface PhotoRequest {
  id: string;
  chatId: string;
  userId: string;
  status: PhotoRequestStatus;
  chance: number;
  photoUrl?: string;
  message: string;
  createdAt: Date;
  chat?: Chat;
}

export interface VideoRequest {
  id: string;
  chatId: string;
  userId: string;
  status: VideoRequestStatus;
  chance: number;
  videoUrl?: string;
  message: string;
  createdAt: Date;
  chat?: Chat;
}

export interface Message {
  id: string;
  isFromUser: boolean;
  type?: 'text' | 'image' | 'voice' | 'short_video';
  text?: string;
  image?: string;
  timestamp: Date;
  isActive: boolean;
  categories?: Category[];
  postCount?: number;
  storyCount?: number; 
  photoCount?: number;
  videoCount?: number;
}