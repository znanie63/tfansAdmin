/*
  # Create balance table

  1. New Tables
    - `balance` table for tracking user token balances
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `amount` (integer)
      - `description` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for admins to manage balances
*/

-- Create balance table
CREATE TABLE IF NOT EXISTS balance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE balance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access"
  ON balance
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin write access"
  ON balance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin delete access"
  ON balance
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Create index for faster balance lookups
CREATE INDEX balance_user_id_idx ON balance(user_id);