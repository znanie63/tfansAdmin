/*
  # Add voice settings table

  1. New Tables
    - `voice_settings`
      - `id` (uuid, primary key)
      - `model_id` (uuid, foreign key)
      - `speed` (numeric)
      - `style` (numeric)
      - `stability` (numeric)
      - `similarity_boost` (numeric)
      - `use_speaker_boost` (boolean)
      - `elevenlabs_voice_id` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on voice_settings table
    - Add policies for admin access
*/

-- Create voice settings table
CREATE TABLE IF NOT EXISTS voice_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES models(id) ON DELETE CASCADE,
  speed numeric NOT NULL DEFAULT 1,
  style numeric NOT NULL DEFAULT 0,
  stability numeric NOT NULL DEFAULT 0,
  similarity_boost numeric NOT NULL DEFAULT 0,
  use_speaker_boost boolean NOT NULL DEFAULT true,
  elevenlabs_voice_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint to ensure one voice setting per model
ALTER TABLE voice_settings
ADD CONSTRAINT voice_settings_model_id_unique UNIQUE (model_id);

-- Enable RLS
ALTER TABLE voice_settings ENABLE ROW LEVEL SECURITY;

-- Add policies for voice_settings
CREATE POLICY "Admins can manage voice settings" ON voice_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_voice_settings_updated_at
  BEFORE UPDATE ON voice_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();