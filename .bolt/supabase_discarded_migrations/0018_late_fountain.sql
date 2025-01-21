/*
  # Add task type constraints and daily task support
  
  1. Changes
    - Add check constraint for task types
    - Add daily_reset column
    - Add daily task validation
  
  2. Security
    - Ensure only one daily task can be active
*/

-- Add check constraint for task types
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_type_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_type_check 
  CHECK (type IN ('social', 'model_follow', 'referral', 'review', 'daily'));

-- Add daily_reset column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'daily_reset'
  ) THEN
    ALTER TABLE tasks ADD COLUMN daily_reset boolean DEFAULT false;
  END IF;
END $$;

-- Create function to ensure only one active daily task
CREATE OR REPLACE FUNCTION check_daily_task()
RETURNS trigger AS $$
BEGIN
  IF NEW.type = 'daily' AND NEW.status = 'active' THEN
    IF EXISTS (
      SELECT 1 FROM tasks 
      WHERE type = 'daily' 
      AND status = 'active' 
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Only one daily task can be active at a time';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for daily task validation
DROP TRIGGER IF EXISTS check_daily_task_trigger ON tasks;
CREATE TRIGGER check_daily_task_trigger
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION check_daily_task();