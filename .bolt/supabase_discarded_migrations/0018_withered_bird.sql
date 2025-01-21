/*
  # Add Admin Creation Trigger

  1. New Function
    - Creates a function to handle new user creation
    - Checks if user should be made admin based on email domain
    - Creates admin record if needed

  2. Trigger
    - Creates trigger on auth.users table
    - Fires after insert
    - Calls the handler function
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user should be made admin (based on email domain)
  IF NEW.email LIKE '%@tfc.com' THEN
    INSERT INTO public.admins (user_id, name, email, avatar)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.email,
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();