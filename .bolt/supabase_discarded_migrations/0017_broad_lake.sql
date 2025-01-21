/*
  # Create tasks table and related schemas

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `type` (task_type enum)
      - `title` (text)
      - `description` (text)
      - `platform` (text, optional)
      - `url` (text, optional)
      - `model_id` (uuid, optional, references models)
      - `referral_count` (integer, optional)
      - `referral_reward` (integer, optional)
      - `reward` (integer)
      - `reward_currency` (text)
      - `status` (task_status enum)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create enums
CREATE TYPE task_type AS ENUM ('social', 'model_follow', 'referral', 'review');
CREATE TYPE task_status AS ENUM ('active', 'inactive');

-- Create tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type task_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  platform text,
  url text,
  model_id uuid REFERENCES models(id) ON DELETE SET NULL,
  referral_count integer CHECK (referral_count > 0),
  referral_reward integer CHECK (referral_reward > 0),
  reward integer NOT NULL CHECK (reward > 0),
  reward_currency text NOT NULL DEFAULT 'TFC',
  status task_status NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin write access"
  ON tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();