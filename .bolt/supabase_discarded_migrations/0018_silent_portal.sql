/*
  # Add users and reviews tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `avatar` (text)
      - `tokens_balance` (integer)
      - `joined_at` (timestamptz)
    
    - `reviews`
      - `id` (uuid, primary key) 
      - `user_id` (uuid, references users)
      - `text` (text)
      - `rating` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `task_completions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `task_id` (uuid, references tasks)
      - `completed_at` (timestamptz)
      - `tokens_earned` (integer)

  2. Security
    - Enable RLS
    - Add policies for read/write access
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  avatar text NOT NULL,
  tokens_balance integer NOT NULL DEFAULT 0,
  joined_at timestamptz DEFAULT now() NOT NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create task_completions table
CREATE TABLE IF NOT EXISTS task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL,
  tokens_earned integer NOT NULL,
  UNIQUE(user_id, task_id)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Public read access"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for reviews
CREATE POLICY "Public read access"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for task_completions
CREATE POLICY "Public read access"
  ON task_completions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can complete tasks"
  ON task_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM task_completions
      WHERE user_id = auth.uid()
      AND task_id = NEW.task_id
    )
  );

-- Create updated_at trigger for reviews
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();