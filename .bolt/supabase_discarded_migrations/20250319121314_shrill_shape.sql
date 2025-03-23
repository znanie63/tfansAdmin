/*
  # Add tier constraints

  1. Changes
    - Add constraints for price and tokens validation
    - Add constraint for description length
    - Enable RLS on tiers table
    - Add policies for admin access

  2. Security
    - Only admins can manage tiers
    - Anyone can read tiers
*/

-- Add constraints for price and tokens
ALTER TABLE tiers
ADD CONSTRAINT tiers_price_check CHECK (price > 0),
ADD CONSTRAINT tiers_tokens_check CHECK (tokens > 0),
ADD CONSTRAINT tiers_description_check CHECK (length(description) <= 20);

-- Enable RLS
ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Admins can manage tiers" ON tiers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read tiers" ON tiers
  FOR SELECT
  TO authenticated
  USING (true);