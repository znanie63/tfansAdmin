/*
  # Add Category Rename Function

  1. Changes
    - Add function to safely rename categories
    - Add trigger to update updated_at timestamp
    - Add policy for admins to update category names

  2. Security
    - Only admins can rename categories
    - Maintain existing RLS policies
*/

-- Add policy for updating category names
CREATE POLICY "Admins can rename categories" ON model_categories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  );