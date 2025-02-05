/*
  # Add storage policies for photos

  1. Storage Policies
    - Public read access for non-private photos
    - Admin read access for all photos
    - Admin write access for photos
    - Admin delete access for photos

  2. Folders
    - profile-images: Public profile photos
    - model-photos: Model gallery photos
    - chat-images: Chat message photos
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;

-- Public read access for non-private photos
CREATE POLICY "Public read access for non-private photos"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'models'
  AND (
    -- Allow access to profile images
    (storage.foldername(name))[1] = 'profile-images'
    -- Allow access to non-private model photos
    OR (
      (storage.foldername(name))[1] = 'model-photos'
      AND EXISTS (
        SELECT 1 FROM model_photos
        WHERE image_path LIKE '%' || storage.filename(name)
        AND NOT is_private
      )
    )
    -- Allow access to chat images
    OR (storage.foldername(name))[1] = 'chat-images'
  )
);

-- Admin read access for all photos
CREATE POLICY "Admin read access for all photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'models'
  AND EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  )
);

-- Admin upload access
CREATE POLICY "Admin upload access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'models'
  AND EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  )
  AND (
    -- Allow uploading to specific folders only
    (storage.foldername(name))[1] IN ('profile-images', 'model-photos', 'chat-images')
  )
);

-- Admin update access
CREATE POLICY "Admin update access"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'models'
  AND EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  )
);

-- Admin delete access
CREATE POLICY "Admin delete access"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'models'
  AND EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  )
);