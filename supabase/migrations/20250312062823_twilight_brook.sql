/*
  # Add model categories

  1. New Tables
    - `model_categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `model_category_assignments`
      - `model_id` (uuid, foreign key)
      - `category_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for admin access
*/

-- Create model categories table
CREATE TABLE IF NOT EXISTS model_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create model category assignments table
CREATE TABLE IF NOT EXISTS model_category_assignments (
  model_id uuid REFERENCES models(id) ON DELETE CASCADE,
  category_id uuid REFERENCES model_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (model_id, category_id)
);

-- Enable RLS
ALTER TABLE model_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_category_assignments ENABLE ROW LEVEL SECURITY;

-- Add policies for model_categories
CREATE POLICY "Admins can manage categories" ON model_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Public read access for categories" ON model_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Add policies for model_category_assignments
CREATE POLICY "Admins can manage category assignments" ON model_category_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Public read access for category assignments" ON model_category_assignments
  FOR SELECT
  TO authenticated
  USING (true);

-- Add updated_at trigger for model_categories
CREATE TRIGGER update_model_categories_updated_at
  BEFORE UPDATE ON model_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();