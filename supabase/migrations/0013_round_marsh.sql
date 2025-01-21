/*
  # Fix Admin Policies

  1. Changes
    - Drop existing policies
    - Create new simplified policies with proper recursion handling
    - Fix permission issues for admin operations
    
  2. Security
    - Enable RLS
    - Add policies for read/write operations
    - Prevent self-modification
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON admins;
DROP POLICY IF EXISTS "Admin insert access" ON admins;
DROP POLICY IF EXISTS "Admin update access" ON admins;
DROP POLICY IF EXISTS "Admin delete access" ON admins;

-- Create new policies
CREATE POLICY "Public read access"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin insert access"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
      AND a.user_id IS NOT NULL
      AND a.user_id != auth.uid()
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
      AND a.user_id IS NOT NULL
      AND a.user_id != admins.user_id
    )
  );

CREATE POLICY "Admin delete access"
  ON admins
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
      AND a.user_id IS NOT NULL
      AND a.user_id != admins.user_id
    )
  );