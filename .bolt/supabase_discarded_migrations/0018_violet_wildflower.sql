/*
  # Add task completions tracking

  1. New Tables
    - `task_completions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `task_id` (uuid, references tasks)
      - `completed_at` (timestamptz)

  2. Security
    - Enable RLS on `task_completions` table
    - Add policies for authenticated users
*/

-- Create task completions table
CREATE TABLE IF NOT EXISTS task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Enable RLS
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own completions"
  ON task_completions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own completions"
  ON task_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all completions"
  ON task_completions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  ));