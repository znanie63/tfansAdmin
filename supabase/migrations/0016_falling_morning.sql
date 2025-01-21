/*
  # Add Posts and Stories Tables

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `model_id` (uuid, foreign key to models)
      - `image_path` (text)
      - `text` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `stories`
      - `id` (uuid, primary key)
      - `model_id` (uuid, foreign key to models)
      - `image_path` (text)
      - `created_at` (timestamp)
      - `expires_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated read access
    - Add policies for admin write access
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS stories CASCADE;

-- Create posts table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES models(id) ON DELETE CASCADE NOT NULL,
  image_path text NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stories table
CREATE TABLE stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES models(id) ON DELETE CASCADE NOT NULL,
  image_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Posts read access" ON posts;
DROP POLICY IF EXISTS "Posts admin insert" ON posts;
DROP POLICY IF EXISTS "Posts admin update" ON posts;
DROP POLICY IF EXISTS "Posts admin delete" ON posts;
DROP POLICY IF EXISTS "Stories read access" ON stories;
DROP POLICY IF EXISTS "Stories admin insert" ON stories;
DROP POLICY IF EXISTS "Stories admin update" ON stories;
DROP POLICY IF EXISTS "Stories admin delete" ON stories;

-- Create policies for posts
CREATE POLICY "Posts read access"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Posts admin insert"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Posts admin update"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Posts admin delete"
  ON posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Create policies for stories
CREATE POLICY "Stories read access"
  ON stories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Stories admin insert"
  ON stories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Stories admin update"
  ON stories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Stories admin delete"
  ON stories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Drop trigger if it exists and create it again
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();