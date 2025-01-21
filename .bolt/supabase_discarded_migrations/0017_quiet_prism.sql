-- Create storage policies for stories folder
CREATE POLICY "Stories folder read access"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'models' AND
    position('stories/' in name) = 1
  );

CREATE POLICY "Stories folder admin upload"
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

CREATE POLICY "Stories folder admin delete"
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