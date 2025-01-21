/*
  # Update Admin Creation Process

  1. Drop Previous Trigger
    - Remove the email domain-based trigger
    - Clean up related functions

  2. Add New Admin Creation Function
    - Creates a function to handle admin creation
    - Only creates admin record when explicitly called
    - Ensures proper user_id linking

  3. Security
    - Function runs with security definer
    - Proper error handling
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create function to handle admin creation
CREATE OR REPLACE FUNCTION create_new_admin(
  admin_user_id uuid,
  admin_name text,
  admin_email text,
  admin_avatar text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the admin record
  INSERT INTO public.admins (
    user_id,
    name,
    email,
    avatar
  ) VALUES (
    admin_user_id,
    admin_name,
    admin_email,
    admin_avatar
  );
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'User is already an administrator';
  WHEN foreign_key_violation THEN
    RAISE EXCEPTION 'User does not exist';
END;
$$;