/*
  # Add Chat Deletion Policy

  1. Changes
    - Add policy to allow users to delete their own chats
    - Add policy to allow admins to delete any chat
    - Ensure cascading deletion of related messages

  2. Security
    - Users can only delete their own chats
    - Admins can delete any chat
    - Messages are automatically deleted when chat is deleted (already handled by ON DELETE CASCADE)
*/

-- Add policy for users to delete their own chats
CREATE POLICY "Users can delete their own chats" ON chats
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  );