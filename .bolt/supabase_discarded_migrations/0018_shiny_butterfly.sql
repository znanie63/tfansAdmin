/*
  # Add daily tasks support
  
  1. Changes
    - Add daily_reset column to tasks table
    - Add daily_completions table for tracking daily task completions
    - Add function to reset daily completions
  
  2. Security
    - Enable RLS on daily_completions
    - Add policies for daily_completions table
*/

-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  platform text,
  url text,
  model_id uuid REFERENCES models(id) ON DELETE CASCADE,
  referral_count integer,
  referral_reward integer,
  reward integer NOT NULL,
  reward_currency text NOT NULL DEFAULT 'TFC',
  status text NOT NULL DEFAULT 'active',
  daily_reset boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily completions table
CREATE TABLE IF NOT EXISTS daily_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
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

-- Create policies for daily completions
CREATE POLICY "Users can read own daily completions"
  ON daily_completions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own daily completions"
  ON daily_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to reset daily completions
CREATE OR REPLACE FUNCTION reset_daily_completions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM daily_completions
  WHERE task_id IN (
    SELECT id FROM tasks WHERE daily_reset = true
  );
END;
$$;