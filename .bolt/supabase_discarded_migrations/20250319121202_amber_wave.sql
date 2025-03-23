/*
  # Add tier ordering functionality

  1. Changes
    - Add position column to tiers table for ordering
    - Add index on position column for faster sorting
    - Add trigger to maintain tier order on insert/update/delete
    - Add constraints for price and tokens validation

  2. Security
    - Maintain existing RLS policies
*/

-- Add position column with default value
ALTER TABLE tiers
ADD COLUMN position integer DEFAULT 0 NOT NULL;

-- Add index for faster sorting
CREATE INDEX idx_tiers_position ON tiers("position");

-- Add constraints for price and tokens
ALTER TABLE tiers
ADD CONSTRAINT tiers_price_check CHECK (price > 0),
ADD CONSTRAINT tiers_tokens_check CHECK (tokens > 0),
ADD CONSTRAINT tiers_description_check CHECK (length(description) <= 20);

-- Create function to reorder tiers
CREATE OR REPLACE FUNCTION reorder_tiers()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update positions to be sequential
  WITH numbered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY position, created_at) - 1 as new_pos
    FROM tiers
  )
  UPDATE tiers t
  SET position = n.new_pos
  FROM numbered n
  WHERE t.id = n.id;
  
  RETURN NULL;
END;
$$;

-- Create trigger to maintain order
CREATE TRIGGER maintain_tier_order
AFTER INSERT OR DELETE OR UPDATE OF position
ON tiers
FOR EACH STATEMENT
EXECUTE FUNCTION reorder_tiers();

-- Add updated_at trigger
CREATE TRIGGER update_tiers_updated_at
BEFORE UPDATE ON tiers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();