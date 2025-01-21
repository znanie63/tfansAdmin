/*
  # Add posts and stories tables

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
    - Add policies for admin access
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  -- Drop posts policies
  PERFORM true FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Posts read access';
  IF FOUND THEN
    DROP POLICY "Posts read access" ON posts;
  END IF;

  PERFORM true FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Posts admin insert';
  IF FOUND THEN
    DROP POLICY "Posts admin insert" ON posts;
  END IF;

  PERFORM true FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Posts admin update';
  IF FOUND THEN
    DROP POLICY "Posts admin update" ON posts;
  END IF;

  PERFORM true FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Posts admin delete';
  IF FOUND THEN
    DROP POLICY "Posts admin delete" ON posts;
  END IF;

  -- Drop stories policies
  PERFORM true FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Stories read access';
  IF FOUND THEN
    DROP POLICY "Stories read access" ON stories;
  END IF;

  PERFORM true FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Stories admin insert';
  IF FOUND THEN
    DROP POLICY "Stories admin insert" ON stories;
  END IF;

  PERFORM true FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Stories admin update';
  IF FOUND THEN
    DROP POLICY "Stories admin update" ON stories;
  END IF;

  PERFORM true FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Stories admin delete';
  IF FOUND THEN
    DROP POLICY "Stories admin delete" ON stories;
  END IF;
END $$;

-- Create posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES models(id) ON DELETE CASCADE NOT NULL,
  image_path text NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stories table if it doesn't exist
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES models(id) ON DELETE CASCADE NOT NULL,
  image_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Posts read access v2"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Posts admin insert v2"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Posts admin update v2"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Posts admin delete v2"
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
CREATE POLICY "Stories read access v2"
  ON stories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Stories admin insert v2"
  ON stories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Stories admin update v2"
  ON stories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Stories admin delete v2"
  ON stories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger for posts
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();