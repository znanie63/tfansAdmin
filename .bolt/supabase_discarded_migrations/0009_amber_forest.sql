/*
  # Fix Admin Policies

  1. Changes
    - Simplify RLS policies for admin management
    - Fix recursive policy checks
    - Enable proper admin creation
    - Prevent self-modification

  2. Security
    - Maintain read access for authenticated users
    - Restrict write operations to existing admins
    - Prevent admins from modifying their own records
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can read all records" ON admins;
DROP POLICY IF EXISTS "Admins can create new admins" ON admins;
DROP POLICY IF EXISTS "Admins can update other admins" ON admins;
DROP POLICY IF EXISTS "Admins can delete other admins" ON admins;

-- Create simplified policies
CREATE POLICY "Anyone can read admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create new admins"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM admins
    )
  );

CREATE POLICY "Admins can update other admins"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admins
    )
    AND user_id != auth.uid()
  );

CREATE POLICY "Admins can delete other admins"
  ON admins
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admins
    )
    AND user_id != auth.uid()
  );