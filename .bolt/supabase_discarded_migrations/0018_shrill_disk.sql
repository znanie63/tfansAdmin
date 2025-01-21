/*
  # Add task completions tracking

  1. New Tables
    - `task_completions`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key to tasks)
      - `user_id` (uuid, foreign key to users)
      - `completed_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for read/write access
*/

-- Create task completions table
CREATE TABLE IF NOT EXISTS task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Enable RLS
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access"
  ON task_completions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own completions"
  ON task_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Admins can manage all completions"
  ON task_completions
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

-- Add trigger to prevent duplicate completions for daily tasks
CREATE OR REPLACE FUNCTION check_daily_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM tasks 
    WHERE id = NEW.task_id 
    AND type = 'daily'
    AND EXISTS (
      SELECT 1 FROM task_completions
      WHERE task_id = NEW.task_id
      AND user_id = NEW.user_id
      AND completed_at > CURRENT_DATE
    )
  ) THEN
    RAISE EXCEPTION 'Daily task already completed today';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_daily_task_completion_trigger
  BEFORE INSERT ON task_completions
  FOR EACH ROW
  EXECUTE FUNCTION check_daily_task_completion();