export interface Model {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  quote: string;
  height: number;
  weight: number;
  languages: string[];
  characteristics?: Record<string, string>;
  chatLink: string;
  instagramLink?: string;
  otherSocialLink?: string;
  prompt?: string;
  profileImage: string;
  price: number;
  price_photo: number;
  postCount?: number;
  storyCount?: number;
}

export interface ModelPhoto {
  id: string;
  modelId: string;
  image: string;
  isPrivate: boolean;
  createdAt: Date;
}

export interface Post {
  id: string;
  modelId: string;
  image: string;
  text: string;
  createdAt: Date;
}

export type TaskType = 'social' | 'referral' | 'review' | 'daily';

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  daily_reset?: boolean;
  platform?: string;
  url?: string;
  modelId?: string;
  referralCount?: number;
  referralReward?: number;
  reward: number;
  rewardCurrency: 'TFC';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  completionsCount?: number;
}

export interface Story {
  id: string;
  modelId: string;
  image: string;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  joinedAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  rating: number;
  createdAt: Date;
}

export type PhotoRequestStatus = 'new' | 'cancel' | 'closed';

export interface PhotoRequest {
  id: string;
  chatId: string;
  userId: string;
  status: PhotoRequestStatus;
  photoUrl?: string;
  message: string;
  createdAt: Date;
  chat?: Chat;
}

export interface Message {
  id: string;
  isFromUser: boolean;
  text?: string;
  image?: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  type: 'regular' | 'photo_request';
  user: User;
  model: Model;
  lastMessage: string;
  lastMessageAt: Date;
  messages: Message[];
}