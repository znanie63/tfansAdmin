/*
  # Fix voice-model relationship

  1. Changes
    - Revert previous changes to voice-model relationship
    - Restore model_id column in voices table
    - Remove voice_id from models table
    - Add proper foreign key constraint

  2. Security
    - Maintain existing RLS policies
*/

-- First remove the foreign key constraint from models table
ALTER TABLE models
DROP CONSTRAINT IF EXISTS models_voice_id_fkey;

-- Remove voice_id column from models table
ALTER TABLE models
DROP COLUMN IF EXISTS voice_id;

-- Add model_id back to voices table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'voices' AND column_name = 'model_id'
  ) THEN
    ALTER TABLE voices
    ADD COLUMN model_id uuid REFERENCES models(id) ON DELETE CASCADE;
  END IF;
END $$;