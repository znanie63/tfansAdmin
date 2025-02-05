/*
  # Fix admin table RLS policies

  1. Changes
    - Drop existing policies that cause infinite recursion
    - Create new policies with direct user_id checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Admins can insert other admins" ON admins;
DROP POLICY IF EXISTS "Admins can update other admins" ON admins;
DROP POLICY IF EXISTS "Admins can delete other admins" ON admins;

-- Create new policies
CREATE POLICY "Admins can view all admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert other admins"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can update other admins"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can delete other admins"
  ON admins
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = auth.uid()
  ));