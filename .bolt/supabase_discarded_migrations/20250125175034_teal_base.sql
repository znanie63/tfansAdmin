/*
  # Add RLS policies for photo requests

  1. Security
    - Enable RLS on photo_requests table
    - Add policies for admins to manage photo requests
    - Add policies for accessing related tables (chats, messages)

  2. Changes
    - Add RLS policies for photo_requests table
    - Add policies for related tables access
*/

-- Enable RLS
ALTER TABLE photo_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for photo_requests
CREATE POLICY "Admins can read photo requests"
  ON photo_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update photo requests"
  ON photo_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Add policies for chats table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chats' AND policyname = 'Admins can read chats'
  ) THEN
    CREATE POLICY "Admins can read chats"
      ON chats
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM admins
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Add policies for messages table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' AND policyname = 'Admins can read messages'
  ) THEN
    CREATE POLICY "Admins can read messages"
      ON messages
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM admins
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;