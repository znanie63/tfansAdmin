/*
  # Fix admin policies

  1. Changes
    - Remove recursive policy checks
    - Simplify admin access control
    - Fix infinite recursion issue

  2. Security
    - Maintain RLS protection
    - Ensure proper admin access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can check if they are admin" ON admins;
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Admins can manage other admins" ON admins;

-- Create new simplified policies
CREATE POLICY "Public read access to admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin write access"
  ON admins
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
      AND user_id <> admins.user_id -- Prevent recursion by excluding self-check
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
      AND user_id <> admins.user_id -- Prevent recursion by excluding self-check
    )
  );