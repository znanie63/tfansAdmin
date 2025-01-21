/*
  # Create tasks and user tasks tracking tables

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `type` (task_type enum)
      - `title` (text)
      - `description` (text) 
      - `platform` (text, nullable)
      - `url` (text, nullable)
      - `model_id` (uuid, nullable, references models)
      - `referral_count` (integer, nullable)
      - `referral_reward` (integer, nullable)
      - `reward` (integer)
      - `reward_currency` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_tasks`
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `task_id` (uuid, references tasks)
      - `status` (user_task_status enum)
      - `completed_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for secure access
*/

-- Create task type enum
CREATE TYPE task_type AS ENUM ('social', 'model_follow', 'referral', 'review');

-- Create user task status enum
CREATE TYPE user_task_status AS ENUM ('available', 'completed', 'locked');

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type task_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  platform text,
  url text,
  model_id uuid REFERENCES models(id) ON DELETE SET NULL,
  referral_count integer,
  referral_reward integer,
  reward integer NOT NULL,
  reward_currency text NOT NULL DEFAULT 'TFC',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_tasks table
CREATE TABLE IF NOT EXISTS user_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  status user_task_status NOT NULL DEFAULT 'available',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tasks_updated_at
  BEFORE UPDATE ON user_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies for tasks table
CREATE POLICY "Public read access for tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage tasks"
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

-- Create policies for user_tasks table
CREATE POLICY "Users can view their own task progress"
  ON user_tasks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own task progress"
  ON user_tasks
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create user task records"
  ON user_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);