import { supabase } from './supabase';
import { Model, ModelPhoto } from '@/types';
import { compressImage } from './utils/image';

// Constants
const MODELS_BUCKET = 'models';
const PROFILE_IMAGES_FOLDER = 'profile-images';
const MODEL_PHOTOS_FOLDER = 'model-photos';

// Types for database records
interface ModelRecord {
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
}

interface ModelPhotoRecord {
  id: string;
  model_id: string;
  image_path: string;
  is_private: boolean;
  created_at: string;
}

function transformModelPhotoFromDB(record: ModelPhotoRecord): ModelPhoto {
  return {
    id: record.id,
    modelId: record.model_id,
    image: record.image_path,
    isPrivate: record.is_private,
    createdAt: new Date(record.created_at),
  };
}

// Helper function to transform database record to Model type
function transformModelFromDB(record: ModelRecord): Model {
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
    prompt: record.prompt || undefined,
    price: record.price || 50,
    price_photo: record.price_photo || 50,
  };
}

// Helper function to transform Model to database record
function transformModelToDB(model: Partial<Model>): Partial<ModelRecord> {
  return {
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
    ...(model.profileImage && { profile_image_path: model.profileImage }),
    ...(model.prompt !== undefined && { prompt: model.prompt || null }),
    ...(model.price !== undefined && { price: model.price }),
    ...(model.price_photo !== undefined && { price_photo: model.price_photo }),
  };
}

export async function uploadModelImage(file: File): Promise<string> {
  if (!file) throw new Error('No file provided');

  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Compress image before upload
  let imageToUpload: File;
  try {
    imageToUpload = await compressImage(file);
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to process image');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${PROFILE_IMAGES_FOLDER}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(MODELS_BUCKET)
    .upload(filePath, imageToUpload);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error('Failed to upload image');
  }

  const { data: { publicUrl } } = supabase.storage
    .from(MODELS_BUCKET)
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function uploadModelPhoto(file: File): Promise<string> {
  if (!file) throw new Error('No file provided');

  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Compress image before upload
  let imageToUpload: File;
  try {
    imageToUpload = await compressImage(file);
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to process image');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${MODEL_PHOTOS_FOLDER}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(MODELS_BUCKET)
    .upload(filePath, imageToUpload);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error('Failed to upload image');
  }

  const { data: { publicUrl } } = supabase.storage
    .from(MODELS_BUCKET)
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function createModel(model: Omit<Model, 'id'>): Promise<Model> {
  const dbRecord = transformModelToDB(model);

  const { data, error } = await supabase
    .from('models')
    .insert(dbRecord)
    .select()
    .single();

  if (error) {
    console.error('Create error:', error);
    throw new Error('Failed to create model');
  }

  if (!data) {
    throw new Error('No data returned after creating model');
  }

  return transformModelFromDB(data as ModelRecord);
}

export async function createModelPhoto(modelId: string, data: { image: string }): Promise<ModelPhoto> {
  const { data: photo, error } = await supabase
    .from('model_photos')
    .insert({
      model_id: modelId,
      image_path: data.image,
      is_private: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Create error:', error);
    throw new Error('Failed to create model photo');
  }

  return transformModelPhotoFromDB(photo as ModelPhotoRecord);
}

export async function updateModel(id: string, model: Partial<Model>): Promise<Model> {
  console.log('Updating model:', { id, model }); // Debug log

  // Handle image upload if provided
  let imagePath = model.profileImage;
  if ('imageFile' in model && model.imageFile instanceof File) {
    try {
      imagePath = await uploadModelImage(model.imageFile);
      console.log('New image uploaded:', imagePath); // Debug log
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload new profile image');
    }
  }

  const dbRecord = transformModelToDB(model);

  const { data, error } = await supabase
    .from('models')
    .update({
      ...dbRecord,
      ...(imagePath && { profile_image_path: imagePath })
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update error:', error);
    throw new Error('Failed to update model');
  }

  if (!data) {
    throw new Error('Model not found');
  }

  return transformModelFromDB(data as ModelRecord);
}

export async function updateModelPhoto(id: string, data: { isPrivate: boolean }): Promise<ModelPhoto> {
  const { data: photo, error } = await supabase
    .from('model_photos')
    .update({
      is_private: data.isPrivate,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update error:', error);
    throw new Error('Failed to update model photo');
  }

  return transformModelPhotoFromDB(photo as ModelPhotoRecord);
}

export async function deleteModel(id: string): Promise<void> {
  const { error } = await supabase
    .from('models')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete model');
  }
}

export async function deleteModelPhoto(id: string): Promise<void> {
  const { error } = await supabase
    .from('model_photos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete model photo');
  }
}

export async function getModels(): Promise<Model[]> {
  console.log('Fetching models from database...'); // Debug log

  // Query models with post and story counts
  const { data, error } = await supabase
    .from('models') 
    .select(`
      *,
      postCount:posts(count),
      storyCount:stories(count)
    `)
    .order('created_at', { ascending: false });

  console.log('Raw database response:', { data, error }); // Debug log

  if (error) {
    console.error('Fetch error:', error);
    throw new Error('Failed to fetch models');
  }

  if (!data) {
    console.log('No data returned from database');
    return [];
  }
  
  const transformedModels = data.map((record: any) => ({
    ...transformModelFromDB(record as ModelRecord),
    postCount: record.postCount?.[0]?.count || 0,
    storyCount: record.storyCount?.[0]?.count || 0
  }));

  console.log('Transformed models:', transformedModels); // Debug log
  return transformedModels;
}

export async function getModel(id: string): Promise<Model> {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Fetch error:', error);
    throw new Error('Failed to fetch model');
  }

  if (!data) {
    throw new Error('Model not found');
  }
  
  return transformModelFromDB(data as ModelRecord);
}

export async function getModelPhotos(modelId: string): Promise<ModelPhoto[]> {
  const { data, error } = await supabase
    .from('model_photos')
    .select('*')
    .eq('model_id', modelId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch error:', error);
    throw new Error('Failed to fetch model photos');
  }

  return (data as ModelPhotoRecord[]).map(transformModelPhotoFromDB);
}