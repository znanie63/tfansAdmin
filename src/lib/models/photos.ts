import { supabase } from '../supabase';
import { ModelPhoto } from '@/types';
import { ModelPhotoRecord } from './types';
import { transformModelPhotoFromDB } from './transformers'; 
import { uploadModelPhoto } from './storage';
import { createBlurredImage } from '../utils/image';

export async function createModelPhoto(modelId: string, data: { image: File; description: string; isPrivate: boolean }): Promise<ModelPhoto> {
  // Generate a single UUID for both original and blurred versions
  const fileId = crypto.randomUUID();

  if (data.isPrivate) {
    try {
      // Create and upload blurred version
      const blurredBlob = await createBlurredImage(data.image);
      const blurredFile = new File([blurredBlob], `${fileId}.${data.image.name.split('.').pop()}`, { type: data.image.type });

      // Upload original to private bucket and blurred to public
      const [originalUrl, blurredUrl] = await Promise.all([
        uploadModelPhoto(data.image, fileId, true),
        uploadModelPhoto(blurredFile, fileId, false)
      ]);

      console.log('Uploaded files:', { originalUrl, blurredUrl });

      const { data: photo, error } = await supabase
        .from('model_photos')
        .insert({
          model_id: modelId,
          image_path: blurredUrl,
          description: data.description,
          is_private: true,
        })
        .select()
        .single();

      if (error) throw error;
      return transformModelPhotoFromDB(photo as ModelPhotoRecord);

    } catch (error) {
      console.error('Error processing private photo:', error);
      throw new Error('Failed to process private photo');
    }
  }

  // For non-private photos, upload to public bucket
  const imagePath = await uploadModelPhoto(data.image, fileId, false);

  const { data: photo, error } = await supabase
    .from('model_photos')
    .insert({
      model_id: modelId,
      image_path: imagePath,
      description: data.description,
      is_private: data.isPrivate,
    })
    .select()
    .single();

  if (error) {
    console.error('Create error:', error);
    throw new Error('Failed to create model photo');
  }

  return transformModelPhotoFromDB(photo as ModelPhotoRecord);
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