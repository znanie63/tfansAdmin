/*
  # Add custom characteristics to models

  1. Changes
    - Add characteristics JSONB column to models table to store custom fields
    - Update RLS policies to include new column
*/

ALTER TABLE models
ADD COLUMN IF NOT EXISTS characteristics jsonb DEFAULT '{}';

COMMENT ON COLUMN models.characteristics IS 'Custom characteristics as key-value pairs';