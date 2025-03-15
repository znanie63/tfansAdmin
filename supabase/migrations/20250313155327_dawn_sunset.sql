/*
  # Add chat_id to balance table

  1. Changes
    - Add chat_id column to balance table for tracking chat-related transactions
    - Add foreign key constraint to chats table
    - Add index for faster lookups
*/

-- Add chat_id column
ALTER TABLE balance
ADD COLUMN chat_id uuid REFERENCES chats(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_balance_chat_id ON balance(chat_id);