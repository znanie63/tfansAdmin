/*
  # Add descriptions to model photos

  1. Changes
    - Add description column to model_photos table for search functionality
    - Add text search vector column for efficient searching
    - Add trigger to automatically update search vector
*/

-- Add description column
ALTER TABLE model_photos ADD COLUMN IF NOT EXISTS description text DEFAULT '';

-- Add search vector column
ALTER TABLE model_photos ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('russian', coalesce(description, ''))) STORED;

-- Create index for fast text search
CREATE INDEX IF NOT EXISTS model_photos_search_idx ON model_photos USING GIN (search_vector);