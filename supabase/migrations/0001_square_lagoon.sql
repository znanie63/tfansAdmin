/*
  # Authentication and Admin Tables

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `email` (text)
      - `avatar` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `admins` table
    - Add policies for admin access
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  avatar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins a 
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Admins can insert other admins"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins a 
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Admins can update other admins"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins a 
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Admins can delete other admins"
  ON admins
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins a 
    WHERE a.user_id = auth.uid()
  ));

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  );
END;
$$;