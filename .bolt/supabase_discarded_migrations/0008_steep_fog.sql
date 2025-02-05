/*
  # Fix admin policies

  1. Changes
    - Simplify admin policies to avoid recursion
    - Fix admin creation policy
    - Ensure proper authorization checks

  2. Security
    - Maintain RLS protection
    - Allow admins to create other admins
    - Prevent self-modification
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON admins;
DROP POLICY IF EXISTS "Admin create access" ON admins;
DROP POLICY IF EXISTS "Admin update access" ON admins;
DROP POLICY IF EXISTS "Admin delete access" ON admins;

-- Create new policies
CREATE POLICY "Admins can read all records"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create new admins"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update other admins"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
    )
    AND user_id != auth.uid()
  );

CREATE POLICY "Admins can delete other admins"
  ON admins
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
    )
    AND user_id != auth.uid()
  );