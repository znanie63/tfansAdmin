/*
  # Add storage policies for posts and stories folders

  1. Storage Policies
    - Add public read access to posts and stories folders
    - Allow admins to upload to posts and stories folders
    - Allow admins to delete from posts and stories folders

  2. Changes
    - Drop existing policies to avoid conflicts
    - Add new policies with unique names
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  PERFORM true FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Models posts read';
  IF FOUND THEN
    DROP POLICY "Models posts read" ON storage.objects;
  END IF;

  PERFORM true FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Models posts upload';
  IF FOUND THEN
    DROP POLICY "Models posts upload" ON storage.objects;
  END IF;

  PERFORM true FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Models posts delete';
  IF FOUND THEN
    DROP POLICY "Models posts delete" ON storage.objects;
  END IF;

  PERFORM true FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Models stories read';
  IF FOUND THEN
    DROP POLICY "Models stories read" ON storage.objects;
  END IF;

  PERFORM true FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Models stories upload';
  IF FOUND THEN
    DROP POLICY "Models stories upload" ON storage.objects;
  END IF;

  PERFORM true FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Models stories delete';
  IF FOUND THEN
    DROP POLICY "Models stories delete" ON storage.objects;
  END IF;
END $$;

-- Create storage policies for posts folder
CREATE POLICY "Models posts read"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'models' AND
    position('posts/' in name) = 1
  );

CREATE POLICY "Models posts upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'models' AND
    position('posts/' in name) = 1 AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Models posts delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'models' AND
    position('posts/' in name) = 1 AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Create storage policies for stories folder
CREATE POLICY "Models stories read"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'models' AND
    position('stories/' in name) = 1
  );

CREATE POLICY "Models stories upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'models' AND
    position('stories/' in name) = 1 AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Models stories delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'models' AND
    position('stories/' in name) = 1 AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );