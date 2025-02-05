/*
  # Add Models Support
  
  1. New Tables
    - models
      - Basic model information
      - References to storage for images
      - Social media links
      
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  nickname text NOT NULL,
  quote text NOT NULL,
  height integer NOT NULL CHECK (height >= 140 AND height <= 220),
  weight integer NOT NULL CHECK (weight >= 40 AND weight <= 150),
  languages text[] NOT NULL DEFAULT '{}',
  chat_link text NOT NULL,
  instagram_link text,
  other_social_link text,
  profile_image_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access"
  ON models
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert models"
  ON models
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update models"
  ON models
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete models"
  ON models
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_models_updated_at
  BEFORE UPDATE ON models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();