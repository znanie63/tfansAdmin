/*
  # Fix admin policies

  1. Changes
    - Simplify admin policies to avoid recursion
    - Add proper authorization checks
    - Prevent self-modification

  2. Security
    - Maintain RLS protection
    - Ensure proper admin access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can read all records" ON admins;
DROP POLICY IF EXISTS "Admins can insert new admins" ON admins;
DROP POLICY IF EXISTS "Admins can update other admins" ON admins;
DROP POLICY IF EXISTS "Admins can delete other admins" ON admins;

-- Create new simplified policies
CREATE POLICY "Public read access"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin create access"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin update access"
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

CREATE POLICY "Admin delete access"
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