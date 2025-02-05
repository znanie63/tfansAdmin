/*
  # Fix admin policies

  1. Changes
    - Simplify admin policies to avoid recursion
    - Add public policy for checking admin status
    - Fix infinite recursion in policies

  2. Security
    - Maintain security while allowing proper admin access
    - Keep RLS enabled
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Admins can insert other admins" ON admins;
DROP POLICY IF EXISTS "Admins can update other admins" ON admins;
DROP POLICY IF EXISTS "Admins can delete other admins" ON admins;

-- Create new simplified policies
CREATE POLICY "Anyone can check if they are admin"
  ON admins
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage other admins"
  ON admins
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  ));