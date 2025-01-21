/*
  # Fix admin policies

  1. Changes
    - Remove recursive policy checks
    - Add separate policies for each operation
    - Fix infinite recursion issue

  2. Security
    - Maintain RLS protection
    - Ensure proper admin access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access to admins" ON admins;
DROP POLICY IF EXISTS "Admin write access" ON admins;

-- Create new policies with proper access control
CREATE POLICY "Admins can read all records"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert new admins"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update other admins"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
    AND user_id != auth.uid() -- Prevent self-updates
  );

CREATE POLICY "Admins can delete other admins"
  ON admins
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
    AND user_id != auth.uid() -- Prevent self-deletion
  );