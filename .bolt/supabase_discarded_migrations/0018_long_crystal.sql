/*
  # Add characteristics to models

  1. Changes
    - Add characteristics JSONB column to models table
    - Add comment explaining the column purpose
*/

ALTER TABLE models 
ADD COLUMN IF NOT EXISTS characteristics jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN models.characteristics IS 'Custom characteristics stored as key-value pairs';