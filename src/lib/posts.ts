import { supabase } from './supabase';
import { Post } from '@/types';
import { compressImage } from './utils/image';

const MODELS_BUCKET = 'models';
const POSTS_FOLDER = 'posts';

interface PostRecord {
  id: string;
  model_id: string;
  image_path: string;
  text: string;
  created_at: string;
  updated_at: string;
}

function transformPostFromDB(record: PostRecord): Post {
  return {
    id: record.id,
    modelId: record.model_id,
    image: record.image_path,
    text: record.text,
    createdAt: new Date(record.created_at),
  };
}

export async function uploadPostImage(file: File): Promise<string> {
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
  const filePath = `${POSTS_FOLDER}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(MODELS_BUCKET)
    .upload(filePath, imageToUpload);

  if (uploadError) {
    console.error('Storage upload error:', { error: uploadError, filePath });
    throw new Error('Failed to upload image');
  }

  const { data: { publicUrl } } = supabase.storage
    .from(MODELS_BUCKET)
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function createPost(modelId: string, data: { image: string; text: string }): Promise<Post> {
  console.log('Creating post:', { modelId, data });

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      model_id: modelId,
      image_path: data.image,
      text: data.text,
    })
    .select()
    .single();

  if (error) {
    console.error('Create error:', error);
    console.error('Database insert error:', { error, modelId, data });
    throw new Error('Failed to create post');
  }

  if (!post) {
    throw new Error('No post data returned after creation');
  }

  return transformPostFromDB(post as PostRecord);
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete post');
  }
}

export async function getModelPosts(modelId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('model_id', modelId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch error:', error);
    throw new Error('Failed to fetch posts');
  }

  return (data as PostRecord[]).map(transformPostFromDB);
}