import { supabase } from '../supabase';
import { ModelVideo } from '@/types';
import { ModelVideoRecord } from './types';
import { transformModelVideoFromDB } from './transformers';
import { uploadModelVideo } from './storage';

export async function createModelVideo(modelId: string, data: { video: string; description: string; isPrivate: boolean }): Promise<ModelVideo> {
  const { data: video, error } = await supabase
    .from('model_videos')
    .insert({
      model_id: modelId,
      image_path: data.video,
      description: data.description,
      is_private: data.isPrivate,
    })
    .select()
    .single();

  if (error) {
    console.error('Create error:', error);
    throw new Error('Failed to create model video');
  }

  return transformModelVideoFromDB(video as ModelVideoRecord);
}

export async function updateModelVideo(id: string, data: { isPrivate?: boolean; description?: string }): Promise<ModelVideo> {
  const { data: video, error } = await supabase
    .from('model_videos')
    .update({
      ...(data.isPrivate !== undefined && { is_private: data.isPrivate }),
      ...(data.description !== undefined && { description: data.description }),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update error:', error);
    throw new Error('Failed to update model video');
  }

  return transformModelVideoFromDB(video as ModelVideoRecord);
}

export async function deleteModelVideo(id: string): Promise<void> {
  const { error } = await supabase
    .from('model_videos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting video:', error);
    throw new Error('Failed to delete model video');
  }
}

export async function getModelVideos(modelId: string): Promise<ModelVideo[]> {
  const { data, error } = await supabase
    .from('model_videos')
    .select('*')
    .eq('model_id', modelId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', error);
    throw new Error('Failed to fetch model videos');
  }

  return (data as ModelVideoRecord[]).map(transformModelVideoFromDB);
}