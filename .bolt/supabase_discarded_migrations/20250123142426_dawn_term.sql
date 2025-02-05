/*
  # Remove task description column

  1. Changes
    - Remove description column from tasks table since it's no longer used
*/

-- Remove description column
ALTER TABLE tasks DROP COLUMN IF EXISTS description;