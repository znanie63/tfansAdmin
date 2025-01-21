import { supabase } from './supabase';
import { Story } from '@/types';
import { compressImage } from './utils/image';

const MODELS_BUCKET = 'models';
const STORIES_FOLDER = 'stories';

interface StoryRecord {
  id: string;
  model_id: string;
  image_path: string;
  created_at: string;
  expires_at: string;
}

function transformStoryFromDB(record: StoryRecord): Story {
  return {
    id: record.id,
    modelId: record.model_id,
    image: record.image_path,
    createdAt: new Date(record.created_at),
    expiresAt: new Date(record.expires_at),
  };
}

export async function uploadStoryImage(file: File): Promise<string> {
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
  const filePath = `${STORIES_FOLDER}/${fileName}`;

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

export async function createStory(modelId: string, data: { image: string }): Promise<Story> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  const { data: story, error } = await supabase
    .from('stories')
    .insert({
      model_id: modelId,
      image_path: data.image,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Create error:', error);
    throw new Error('Failed to create story');
  }

  return transformStoryFromDB(story as StoryRecord);
}

export async function deleteStory(id: string): Promise<void> {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete story');
  }
}

export async function getModelStories(modelId: string): Promise<Story[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('model_id', modelId)
    .gt('expires_at', now)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch error:', error);
    throw new Error('Failed to fetch stories');
  }

  return (data as StoryRecord[]).map(transformStoryFromDB);
}