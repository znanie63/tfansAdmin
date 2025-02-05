/*
  # Add storage for model images

  1. Storage Setup
    - Create bucket for model images
    - Set up public access policies
  
  2. Security
    - Enable RLS on storage
    - Add policies for admin access
*/

-- Create storage bucket for model images
INSERT INTO storage.buckets (id, name, public)
VALUES ('models', 'models', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to model images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'models');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'models'
  AND (storage.foldername(name))[1] = 'profile-images'
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'models'
  AND EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  )
);