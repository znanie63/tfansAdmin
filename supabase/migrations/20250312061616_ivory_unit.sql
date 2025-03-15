/*
  # Add Model Active Status

  1. Changes
    - Add `is_active` column to models table with default value true
    - Add index on `is_active` column for faster filtering
    - Update existing models to be active by default

  2. Security
    - Only admins can update the active status
*/

-- Add is_active column with default value true
ALTER TABLE models 
ADD COLUMN is_active boolean DEFAULT true NOT NULL;

-- Add index for faster filtering
CREATE INDEX idx_models_is_active ON models(is_active);

-- Update existing models to be active
UPDATE models SET is_active = true WHERE is_active IS NULL;