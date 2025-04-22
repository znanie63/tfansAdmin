/*
  # Add blurred version support for private photos

  1. Changes
    - Add blurred_image_path column to model_photos table
    - Add trigger to automatically clear blurred image when photo is made public
    - Add function to handle blurred image cleanup

  2. Security
    - Maintain existing RLS policies
    - Only allow admins to manage blurred images
*/

-- Add blurred image path column
ALTER TABLE model_photos 
ADD COLUMN blurred_image_path text;

-- Create function to handle blurred image cleanup
CREATE OR REPLACE FUNCTION clear_blurred_image()
RETURNS TRIGGER AS $$
BEGIN
  -- If photo is made public, clear the blurred image path
  IF OLD.is_private = true AND NEW.is_private = false THEN
    NEW.blurred_image_path = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically clear blurred image when photo is made public
CREATE TRIGGER clear_blurred_image_trigger
  BEFORE UPDATE ON model_photos
  FOR EACH ROW
  WHEN (OLD.is_private IS DISTINCT FROM NEW.is_private)
  EXECUTE FUNCTION clear_blurred_image();