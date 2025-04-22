import { Model, ModelPhoto, ModelVideo } from '@/types';

export interface ModelRecord {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string;
  quote: string;
  height: number;
  weight: number;
  languages: string[];
  chat_link: string;
  instagram_link: string | null;
  other_social_link: string | null;
  profile_image_path: string;
  characteristics: Record<string, string> | null;
  created_at: string;
  updated_at: string;
  categories: {
    category: {
      id: string;
      name: string;
      created_at: string;
      updated_at: string;
    };
  }[];
}

export interface ModelPhotoRecord {
  id: string;
  model_id: string;
  image_path: string;
  blurred_image_path: string | null;
  description: string;
  is_private: boolean;
  created_at: string;
}

export interface ModelVideoRecord {
  id: string;
  model_id: string;
  image_path: string;
  description: string;
  is_private: boolean;
  created_at: string;
}