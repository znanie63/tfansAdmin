import { supabase } from './supabase';
import { Model, ModelPhoto } from '@/types';
import { assignCategories } from '@/lib/categories';
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
  updated_at: string,
  categories: {
    category: {
      id: string;
      name: string;
      created_at: string;
      updated_at: string;
    };
  }[];
}

interface ModelPhotoRecord {
  id: string;
  model_id: string;
  image_path: string;
  description: string;
  is_private: boolean;
  created_at: string;
}

function transformModelPhotoFromDB(record: ModelPhotoRecord): ModelPhoto {
  return {
    id: record.id,
    modelId: record.model_id,
    image: record.image_path,
    description: record.description || '',
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
    categories: record.categories?.map(c => ({
      id: c.category.id,
      name: c.category.name,
      createdAt: new Date(c.category.created_at),
      updatedAt: new Date(c.category.updated_at)
    })),
    prompt: record.prompt || undefined,
    price: record.price || 50,
    price_photo: record.price_photo || 50,
    isActive: record.is_active,
  };
}

// Helper function to transform Model to database record
function transformModelToDB(model: Partial<Model>): Partial<ModelRecord> {
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
    ...(model.isActive !== undefined && { is_active: model.isActive }),
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
  try {
    console.log('Creating model with data:', model);
    
    // Extract category IDs before modifying the model object
    const categoryIds = Array.isArray(model.categories) 
      ? model.categories 
      : model.categories?.map(c => c.id) || [];
    
    delete model.categories; // Remove categories from model data

    // Upload image first if provided
    let profileImageUrl = '';
    if (model.imageFile) {
      try {
        profileImageUrl = await uploadModelImage(model.imageFile);
        console.log('Image uploaded successfully:', profileImageUrl);
      } catch (error) {
        console.error('Image upload error:', error);
        throw new Error('Failed to upload profile image');
      }
    }

    const modelData = {
      ...model,
      profileImage: profileImageUrl // Set the profile image URL
    };

    const dbRecord = transformModelToDB({
      ...modelData
    });

    console.log('Creating model with data:', dbRecord);

    const { data, error } = await supabase
      .from('models')
      .insert(dbRecord)
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned after creating model');
    }

    console.log('Model created successfully:', data);

    // Assign categories if any
    try {
      if (categoryIds.length > 0) {
        await assignCategories(data.id, categoryIds);
        console.log('Categories assigned successfully:', categoryIds);
      }
    } catch (error) {
      console.error('Error assigning categories:', error);
      throw new Error('Failed to assign categories');
    }

    return transformModelFromDB(data as ModelRecord);
  } catch (error) {
    console.error('Create model error:', error);
    throw error;
  }
}

export async function createModelPhoto(modelId: string, data: { image: string; description: string }): Promise<ModelPhoto> {
  const { data: photo, error } = await supabase
    .from('model_photos')
    .insert({
      model_id: modelId,
      image_path: data.image,
      description: data.description,
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
  try {
    let imagePath = undefined;
    // Extract and store categories before deleting from model data
    const categoryIds = Array.isArray(model.categories) 
      ? model.categories 
      : model.categories?.map(c => c.id) || [];

    console.log('Updating model:', { id, model, categoryIds }); // Debug log

    const modelData = { ...model };
    delete modelData.categories; // Remove categories from model data

    if (model.imageFile) {
      imagePath = await uploadModelImage(model.imageFile);
      console.log('New image uploaded:', imagePath); // Debug log
    }

    const dbRecord = transformModelToDB({
      ...modelData, // Use modelData instead of model to exclude categories
      ...(imagePath && { profileImage: imagePath })
    });

    console.log('Database record:', dbRecord); // Debug log

    const { data, error } = await supabase
      .from('models')
      .update(dbRecord)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database update error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Model not found');
    }

    // Update category assignments
    console.log('Updating categories:', categoryIds); // Debug log
    await assignCategories(id, categoryIds);

    return transformModelFromDB(data as ModelRecord);
  } catch (error) {
    console.error('Update error:', error);
    throw new Error('Failed to update model');
  }
}

export async function updateModelPhoto(id: string, data: { isPrivate?: boolean; description?: string }): Promise<ModelPhoto> {
  const { data: photo, error } = await supabase
    .from('model_photos')
    .update({
      ...(data.isPrivate !== undefined && { is_private: data.isPrivate }),
      ...(data.description !== undefined && { description: data.description }),
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
      categories:model_category_assignments(
        category:model_categories(
          id,
          name,
          created_at,
          updated_at
        )
      ),
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
    .select(`
      *,
      categories:model_category_assignments(
        category:model_categories(
          id,
          name,
          created_at,
          updated_at
        )
      )
    `)
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