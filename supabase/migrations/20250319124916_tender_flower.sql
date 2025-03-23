/*
  # Add invoice link to tiers

  1. Changes
    - Add invoice_link column to tiers table
    - Make it optional URL field
*/

-- Add invoice_link column
ALTER TABLE tiers
ADD COLUMN invoice_link text;