/*
  # Add tier activation functionality

  1. Changes
    - Add is_active column to tiers table
    - Add index for faster filtering
    - Set default value to true for existing tiers

  2. Security
    - Maintain existing RLS policies
*/

-- Add is_active column with default value true
ALTER TABLE tiers
ADD COLUMN is_active boolean DEFAULT true NOT NULL;

-- Add index for faster filtering
CREATE INDEX idx_tiers_is_active ON tiers(is_active);

-- Update existing tiers to be active
UPDATE tiers SET is_active = true WHERE is_active IS NULL;