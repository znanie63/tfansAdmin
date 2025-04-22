/*
  # Add voice_id to models table

  1. Changes
    - Add voice_id column to models table
    - Add foreign key constraint to voices table
    - Add index for faster lookups
    - Add trigger to update voice_id in models when voice is created

  2. Security
    - Maintain existing RLS policies
*/

-- Add voice_id column
ALTER TABLE models
ADD COLUMN voice_id uuid REFERENCES voices(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_models_voice_id ON models(voice_id);

-- Create trigger function to update model's voice_id when voice is created
CREATE OR REPLACE FUNCTION update_model_voice_id()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE models
  SET voice_id = NEW.id
  WHERE id = NEW.model_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_model_voice_id_trigger
AFTER INSERT ON voices
FOR EACH ROW
EXECUTE FUNCTION update_model_voice_id();