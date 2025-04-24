import { Model, ModelPhoto, ModelVideo } from '@/types';
import { ModelRecord, ModelPhotoRecord, ModelVideoRecord } from './types';

export function transformModelFromDB(record: ModelRecord): Model {
  return {
    id: record.id,
    firstName: record.first_name,
    lastName: record.last_name,
    nickname: record.nickname,
    quote: record.quote,
    height: record.height,
    weight: record.weight,
    languages: record.languages,
    chatLink: record.chat_link,
    characteristics: record.characteristics || undefined,
    instagramLink: record.instagram_link || undefined,
    otherSocialLink: record.other_social_link || undefined,
    profileImage: record.profile_image_path,
    categories: record.categories?.map(c => ({
      id: c.category.id,
      name: c.category.name,
      createdAt: new Date(c.category.created_at),
      updatedAt: new Date(c.category.updated_at)
    })),
    prompt: record.prompt || undefined,
    price: record.price || 50,
    price_photo: record.price_photo || 50,
    price_voice: record.price_voice || 50,
    price_video: record.price_video || 50,
    send_voice_chance: record.send_voice_chance || 50,
    isActive: record.is_active,
  };
}

export function transformModelToDB(model: Partial<Model>): Partial<ModelRecord> {
  return {
    profile_image_path: model.profileImage,
    ...(model.firstName && { first_name: model.firstName }),
    ...(model.lastName && { last_name: model.lastName }),
    ...(model.nickname && { nickname: model.nickname }),
    ...(model.quote && { quote: model.quote }),
    ...(model.height && { height: model.height }),
    ...(model.weight && { weight: model.weight }),
    ...(model.languages && { languages: model.languages }),
    ...(model.chatLink && { chat_link: model.chatLink }),
    ...(model.characteristics && { characteristics: model.characteristics }),
    ...(model.instagramLink !== undefined && { instagram_link: model.instagramLink || null }),
    ...(model.otherSocialLink !== undefined && { other_social_link: model.otherSocialLink || null }),
    ...(model.prompt !== undefined && { prompt: model.prompt || null }),
    ...(model.price !== undefined && { price: model.price }),
    ...(model.price_photo !== undefined && { price_photo: model.price_photo }),
    ...(model.price_voice !== undefined && { price_voice: model.price_voice }),
    ...(model.price_video !== undefined && { price_video: model.price_video }),
    ...(model.send_voice_chance !== undefined && { send_voice_chance: model.send_voice_chance }),
    ...(model.isActive !== undefined && { is_active: model.isActive }),
  };
}

export function transformModelPhotoFromDB(record: ModelPhotoRecord): ModelPhoto {
  return {
    id: record.id,
    modelId: record.model_id,
    image: record.image_path,
    description: record.description || '',
    isPrivate: record.is_private,
    createdAt: new Date(record.created_at),
  };
}

export function transformModelVideoFromDB(record: ModelVideoRecord): ModelVideo {
  return {
    id: record.id,
    modelId: record.model_id,
    video: record.image_path,
    description: record.description || '',
    isPrivate: record.is_private,
    createdAt: new Date(record.created_at),
  };
}