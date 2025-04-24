import { supabase } from '../supabase';
import { Model } from '@/types';
import { ModelRecord } from './types';
import { transformModelFromDB, transformModelToDB } from './transformers';
import { uploadModelImage } from './storage';
import { assignCategories } from '../categories';
import { createVoice, updateVoice } from '../voices';
import { getModelVideos, createModelVideo, updateModelVideo, deleteModelVideo } from './videos';

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
    } as any;
    
    // Remove voice data to prevent automatic voice creation
    delete modelData.voice;

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

    // Create voice settings if provided
    if (modelData.voice) {
      try {
        await createVoice({
          ...modelData.voice,
          modelId: data.id
        });
        console.log('Voice settings created successfully');
      } catch (error) {
        console.error('Error creating voice settings:', error);
        // Don't throw error here, just log it
      }
    }

    return transformModelFromDB(data as ModelRecord);
  } catch (error) {
    console.error('Create model error:', error);
    throw error;
  }
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

    // Remove voice data to prevent automatic voice creation/update
    delete modelData.voice;

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
      storyCount:stories(count),
      photoCount:model_photos(count),
      videoCount:model_videos(count)
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
    storyCount: record.storyCount?.[0]?.count || 0,
    photoCount: record.photoCount?.[0]?.count || 0,
    videoCount: record.videoCount?.[0]?.count || 0
  }));

  console.log('Transformed models:', transformedModels); // Debug log
  return transformedModels;
}

export * from './photos';
export * from './videos';
export * from './storage';
export * from './types';
export * from './transformers';