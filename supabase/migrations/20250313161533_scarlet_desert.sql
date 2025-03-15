/*
  # Add indexes for chat statistics

  1. Changes
    - Add index on messages chat_id for faster aggregation
    - Add index on messages created_at for time-based queries
*/

-- Add index for faster message counting per chat
CREATE INDEX IF NOT EXISTS messages_chat_id_idx ON messages(chat_id);

-- Add index for time-based message queries
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);