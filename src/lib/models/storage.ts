import { supabase } from '../supabase';
import { compressImage, createBlurredImage } from '../utils/image';

// Constants
const MODELS_BUCKET = 'models';
const PRIVATE_MODELS_BUCKET = 'private_model_photos';
const PROFILE_IMAGES_FOLDER = 'profile-images';
const MODEL_PHOTOS_FOLDER = 'model-photos';
const MODEL_VIDEOS_FOLDER = 'model-videos';

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

export async function uploadModelPhoto(file: File, fileId: string, isPrivate: boolean = false): Promise<string> {
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
  const fileName = `${fileId}.${fileExt}`;
  const filePath = `${MODEL_PHOTOS_FOLDER}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(isPrivate ? PRIVATE_MODELS_BUCKET : MODELS_BUCKET)
    .upload(filePath, imageToUpload);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error('Failed to upload image');
  }

  const { data: { publicUrl } } = supabase.storage
    .from(isPrivate ? PRIVATE_MODELS_BUCKET : MODELS_BUCKET)
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function uploadModelVideo(file: File): Promise<string> {
  if (!file) throw new Error('No file provided');

  if (!file.type.startsWith('video/')) {
    throw new Error('File must be a video');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${MODEL_VIDEOS_FOLDER}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(MODELS_BUCKET)
    .upload(filePath, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error('Failed to upload video');
  }

  const { data: { publicUrl } } = supabase.storage
    .from(MODELS_BUCKET)
    .getPublicUrl(filePath);

  return publicUrl;
}