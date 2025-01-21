/*
  # Create task completions tables

  1. New Tables
    - `task_completions`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `user_id` (uuid, references users)
      - `completed_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create task completions table
CREATE TABLE IF NOT EXISTS task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now()
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

-- Add trigger to prevent completions for daily tasks
CREATE OR REPLACE FUNCTION check_non_daily_task_type()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM tasks 
    WHERE id = NEW.task_id 
    AND type = 'daily'
  ) THEN
    RAISE EXCEPTION 'Daily tasks must be recorded in daily_completions';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_non_daily_task_type_trigger
  BEFORE INSERT ON task_completions
  FOR EACH ROW
  EXECUTE FUNCTION check_non_daily_task_type();