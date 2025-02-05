/*
  # Add model photos management

  1. New Tables
    - `model_photos`
      - `id` (uuid, primary key)
      - `model_id` (uuid, references models)
      - `image_path` (text)
      - `is_private` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `model_photos` table
    - Add policies for admin access
*/

-- Create model_photos table
CREATE TABLE model_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES models(id) ON DELETE CASCADE NOT NULL,
  image_path text NOT NULL,
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE model_photos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for non-private photos"
  ON model_photos
  FOR SELECT
  TO authenticated
  USING (NOT is_private);

CREATE POLICY "Admins can read all photos"
  ON model_photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert photos"
  ON model_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update photos"
  ON model_photos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete photos"
  ON model_photos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_model_photos_updated_at
  BEFORE UPDATE ON model_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();