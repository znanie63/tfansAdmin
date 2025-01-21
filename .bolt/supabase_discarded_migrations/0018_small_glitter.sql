/*
  # Add daily task completions tracking

  1. New Tables
    - `daily_completions`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key to tasks)
      - `user_id` (uuid, foreign key to users)
      - `completed_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for read/write access
*/

-- Create daily completions table
CREATE TABLE IF NOT EXISTS daily_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(task_id, user_id, DATE(completed_at))
);

-- Enable RLS
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access"
  ON daily_completions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own completions"
  ON daily_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Admins can manage all completions"
  ON daily_completions
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

-- Add trigger to prevent completions for non-daily tasks
CREATE OR REPLACE FUNCTION check_daily_task_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM tasks 
    WHERE id = NEW.task_id 
    AND type = 'daily'
  ) THEN
    RAISE EXCEPTION 'Only daily tasks can be recorded in daily_completions';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_daily_task_type_trigger
  BEFORE INSERT ON daily_completions
  FOR EACH ROW
  EXECUTE FUNCTION check_daily_task_type();