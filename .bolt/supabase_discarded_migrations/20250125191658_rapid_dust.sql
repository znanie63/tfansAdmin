/*
  # Add message price column to models table

  1. Changes
    - Add `price` column to models table for message pricing (default 50)

  Note: price_photo column already exists for photo pricing
*/

-- Add price column for message pricing
ALTER TABLE models ADD COLUMN IF NOT EXISTS price integer NOT NULL DEFAULT 50;