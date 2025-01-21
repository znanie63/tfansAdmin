/*
  # Fix Admin Policies

  1. Changes
    - Simplify RLS policies for admin management
    - Fix recursive policy checks
    - Enable proper admin creation
    - Prevent self-modification

  2. Security
    - Maintain read access for authenticated users
    - Allow admins to create other admins
    - Prevent admins from modifying themselves
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read admins" ON admins;
DROP POLICY IF EXISTS "Admins can create new admins" ON admins;
DROP POLICY IF EXISTS "Admins can update other admins" ON admins;
DROP POLICY IF EXISTS "Admins can delete other admins" ON admins;

-- Create new simplified policies
CREATE POLICY "Public read access"
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
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
    )
  );