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

-- Add daily_reset to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS daily_reset boolean DEFAULT false;

-- Create daily completions table
CREATE TABLE IF NOT EXISTS daily_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Enable RLS
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
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