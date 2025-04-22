/*
  # Update voice-model relationship

  1. Changes
    - Remove model_id column from voices table
    - Make voice_id NOT NULL in models table
    - Update foreign key to cascade delete
    - Drop old trigger that's no longer needed

  2. Security
    - Maintain existing RLS policies
*/

-- Remove model_id column from voices table
ALTER TABLE voices
DROP COLUMN model_id;

-- Add NOT NULL constraint to voice_id in models table
ALTER TABLE models
ALTER COLUMN voice_id SET NOT NULL;

-- Drop old trigger that's no longer needed
DROP TRIGGER IF EXISTS update_model_voice_id_trigger ON voices;
DROP FUNCTION IF EXISTS update_model_voice_id();

-- Update foreign key to cascade delete
ALTER TABLE models
DROP CONSTRAINT models_voice_id_fkey,
ADD CONSTRAINT models_voice_id_fkey
  FOREIGN KEY (voice_id)
  REFERENCES voices(id)
  ON DELETE CASCADE;