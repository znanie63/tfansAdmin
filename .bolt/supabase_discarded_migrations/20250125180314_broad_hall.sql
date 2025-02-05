/*
  # Fix storage policies for model photos

  1. Changes
    - Simplify storage policies to ensure proper access
    - Fix policy conditions for model photos
    - Add proper bucket and folder checks

  2. Security
    - Maintain public read access for non-private content
    - Ensure admin-only access for private content
    - Protect upload and delete operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access for non-private photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin read access for all photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload access" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access" ON storage.objects;

-- Public read access for non-private content
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'models'
  AND (
    -- Always allow access to profile images
    (storage.foldername(name))[1] = 'profile-images'
    OR
    -- Allow access to non-private model photos
    ((storage.foldername(name))[1] = 'model-photos' AND NOT EXISTS (
      SELECT 1 FROM model_photos
      WHERE image_path LIKE '%' || storage.filename(name)
      AND is_private = true
    ))
    OR
    -- Always allow access to chat images
    (storage.foldername(name))[1] = 'chat-images'
  )
);

-- Admin full access
CREATE POLICY "Admin full access"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'models'
  AND EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  )
  AND (storage.foldername(name))[1] IN (
    'profile-images',
    'model-photos',
    'chat-images'
  )
)
WITH CHECK (
  bucket_id = 'models'
  AND EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  )
  AND (storage.foldername(name))[1] IN (
    'profile-images',
    'model-photos',
    'chat-images'
  )
);