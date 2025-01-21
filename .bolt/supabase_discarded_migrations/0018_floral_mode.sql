/*
  # Add completed tasks tracking

  1. New Tables
    - `completed_tasks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `task_id` (uuid, references tasks)
      - `completed_at` (timestamptz)
      - `tokens_earned` (integer)

  2. Security
    - Enable RLS
    - Add policies for read/write access
*/

-- Create completed_tasks table
CREATE TABLE IF NOT EXISTS completed_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL,
  tokens_earned integer NOT NULL,
  UNIQUE(user_id, task_id)
);

-- Enable RLS
ALTER TABLE completed_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access"
  ON completed_tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage completed tasks"
  ON completed_tasks
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

-- Create function to check if task is completed by user
CREATE OR REPLACE FUNCTION is_task_completed(p_user_id uuid, p_task_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM completed_tasks
    WHERE user_id = p_user_id
    AND task_id = p_task_id
  );
END;
$$;