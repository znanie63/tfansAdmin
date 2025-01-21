/*
  # Add users table and policies

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text)
      - `avatar` (text)
      - `tokens_balance` (integer)
      - `joined_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for read/write access
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  avatar text,
  tokens_balance integer DEFAULT 0,
  joined_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );