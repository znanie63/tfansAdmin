/*
  # Create task helper functions
  
  Creates functions to manage task requirements, status, and completion:
  
  1. Functions
    - `check_task_requirements` - Checks if a user meets task requirements
    - `get_user_task_status` - Gets current task status for a user
    - `complete_task` - Handles task completion and token rewards
  
  2. Security
    - All functions use SECURITY DEFINER
    - Input validation included
*/

-- Create enum for task status if it doesn't exist
DO $$ BEGIN
  CREATE TYPE user_task_status AS ENUM (
    'available',
    'locked',
    'in_progress',
    'completed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Function to check if a user meets task requirements
CREATE OR REPLACE FUNCTION check_task_requirements(
  p_user_id uuid,
  p_task_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_task_type task_type;
  v_completed_count integer;
BEGIN
  -- Get task type
  SELECT type INTO v_task_type
  FROM tasks
  WHERE id = p_task_id;

  -- For referral tasks, check if user has enough referrals
  IF v_task_type = 'referral' THEN
    SELECT COUNT(*) INTO v_completed_count
    FROM user_tasks ut
    JOIN tasks t ON t.id = ut.task_id
    WHERE ut.user_id = p_user_id
    AND t.type = 'referral'
    AND ut.status = 'completed';
    
    RETURN v_completed_count >= (
      SELECT referral_count 
      FROM tasks 
      WHERE id = p_task_id
    );
  END IF;

  -- For other task types, always return true for now
  -- Additional requirements can be added here later
  RETURN true;
END;
$$;

-- Function to get task status for a user
CREATE OR REPLACE FUNCTION get_user_task_status(
  p_user_id uuid,
  p_task_id uuid
)
RETURNS user_task_status
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status user_task_status;
BEGIN
  -- Get existing status if any
  SELECT status INTO v_status
  FROM user_tasks
  WHERE user_id = p_user_id
  AND task_id = p_task_id;

  -- If no status exists yet
  IF v_status IS NULL THEN
    -- Check if task is available
    IF check_task_requirements(p_user_id, p_task_id) THEN
      RETURN 'available'::user_task_status;
    ELSE
      RETURN 'locked'::user_task_status;
    END IF;
  END IF;

  RETURN v_status;
END;
$$;

-- Function to complete a task and award tokens
CREATE OR REPLACE FUNCTION complete_task(
  p_user_id uuid,
  p_task_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reward integer;
BEGIN
  -- Verify task exists and is active
  SELECT reward INTO v_reward
  FROM tasks
  WHERE id = p_task_id
  AND status = 'active';

  IF v_reward IS NULL THEN
    RETURN false;
  END IF;

  -- Check if task is already completed
  IF EXISTS (
    SELECT 1 FROM user_tasks
    WHERE user_id = p_user_id
    AND task_id = p_task_id
    AND status = 'completed'
  ) THEN
    RETURN false;
  END IF;

  -- Check requirements
  IF NOT check_task_requirements(p_user_id, p_task_id) THEN
    RETURN false;
  END IF;

  -- Insert or update user_task record
  INSERT INTO user_tasks (
    user_id,
    task_id,
    status,
    completed_at
  )
  VALUES (
    p_user_id,
    p_task_id,
    'completed',
    now()
  )
  ON CONFLICT (user_id, task_id)
  DO UPDATE SET
    status = 'completed',
    completed_at = now(),
    updated_at = now();

  -- TODO: Award tokens to user
  -- This will be implemented when user wallet/balance system is added

  RETURN true;
END;
$$;