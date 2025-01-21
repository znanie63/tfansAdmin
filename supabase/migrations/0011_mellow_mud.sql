/*
  # Fix Admin Policies

  1. Changes
    - Fix NEW reference in policies
    - Separate policies by operation
    - Prevent self-modification
    - Enable proper admin management

  2. Security
    - Allow authenticated users to read admin records
    - Allow admins to create/update/delete other admins
    - Prevent admins from modifying their own records
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON admins;
DROP POLICY IF EXISTS "Admin write access" ON admins;

-- Create new simplified policies
CREATE POLICY "Anyone can read admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
    AND user_id != auth.uid()
  );

CREATE POLICY "Admins can delete"
  ON admins
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
    AND user_id != auth.uid()
  );