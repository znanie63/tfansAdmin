/*
  # Add daily tasks support
  
  1. Changes
    - Add daily_reset column
    - Add daily task constraints
    - Add function to check active daily tasks
  
  2. Security
    - Ensure only one daily task can be active
*/

-- Create tasks table if not exists
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  platform text,
  url text,
  model_id uuid REFERENCES models(id),
  referral_count integer,
  referral_reward integer,
  reward integer NOT NULL,
  reward_currency text NOT NULL DEFAULT 'TFC',
  status text NOT NULL DEFAULT 'active',
  daily_reset boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT tasks_type_check CHECK (
    type IN ('social', 'model_follow', 'referral', 'review', 'daily')
  ),
  CONSTRAINT tasks_status_check CHECK (
    status IN ('active', 'inactive')
  )
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create function to check active daily tasks
CREATE OR REPLACE FUNCTION check_active_daily_task()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'daily' AND NEW.status = 'active' THEN
    IF EXISTS (
      SELECT 1 FROM tasks 
      WHERE type = 'daily' 
      AND status = 'active' 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Only one daily task can be active at a time. Please deactivate the existing daily task first.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS check_daily_task_trigger ON tasks;
CREATE TRIGGER check_daily_task_trigger
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION check_active_daily_task();

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