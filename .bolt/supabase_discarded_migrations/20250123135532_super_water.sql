/*
  # Remove stories expiration

  1. Changes
    - Remove expires_at column from stories table
    - Update stories table policies to not check expiration
*/

-- Remove expires_at column
ALTER TABLE stories DROP COLUMN IF EXISTS expires_at;

-- Update stories table policies
DROP POLICY IF EXISTS "Stories read access" ON stories;
CREATE POLICY "Stories read access"
  ON stories
  FOR SELECT
  TO authenticated
  USING (true);