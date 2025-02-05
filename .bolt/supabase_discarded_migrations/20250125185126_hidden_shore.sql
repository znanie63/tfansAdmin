/*
  # Add balance tracking

  1. New Tables
    - `balance`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (integer)
      - `type` (text)
      - `description` (text)
      - `created_at` (timestamptz)

  2. Changes
    - Add `price_photo` column to models table
*/

-- Add price_photo column to models table
ALTER TABLE models ADD COLUMN IF NOT EXISTS price_photo integer NOT NULL DEFAULT 50;

-- Create balance table
CREATE TABLE IF NOT EXISTS balance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE balance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own balance"
  ON balance
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all balance records"
  ON balance
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can insert balance records"
  ON balance
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  ));