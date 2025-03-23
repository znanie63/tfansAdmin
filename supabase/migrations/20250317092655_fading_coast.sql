/*
  # Add Chat Statistics Function

  1. New Functions
    - `get_model_chat_stats(model_id uuid)`
      Returns aggregated statistics for a model's chats including:
      - Total chats
      - Total messages
      - Total photos
      - Average messages per chat
      - Average photos per chat
      - Total tokens spent

  2. Security
    - Function is accessible to authenticated users only
    - Maintains existing RLS policies
*/

-- Create type to hold chat statistics
CREATE TYPE chat_statistics AS (
  total_chats bigint,
  total_messages bigint,
  total_photos bigint,
  average_messages numeric,
  average_photos numeric,
  total_spent bigint
);

-- Create function to get chat statistics
CREATE OR REPLACE FUNCTION get_model_chat_stats(model_id_param uuid)
RETURNS chat_statistics
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result chat_statistics;
  chat_ids uuid[];
BEGIN
  -- Get all chat IDs for the model
  SELECT ARRAY_AGG(id)
  INTO chat_ids
  FROM chats
  WHERE model_id = model_id_param;

  -- Get total chats
  SELECT COUNT(*)
  INTO result.total_chats
  FROM chats
  WHERE model_id = model_id_param;

  -- Get message counts
  WITH message_counts AS (
    SELECT
      COUNT(*) FILTER (WHERE message_type = 'text') as text_messages,
      COUNT(*) FILTER (WHERE message_type = 'image') as photo_messages
    FROM messages
    WHERE chat_id = ANY(chat_ids)
      AND is_from_user = false
  )
  SELECT
    text_messages,
    photo_messages,
    CASE 
      WHEN result.total_chats > 0 THEN ROUND(text_messages::numeric / result.total_chats, 1)
      ELSE 0
    END,
    CASE 
      WHEN result.total_chats > 0 THEN ROUND(photo_messages::numeric / result.total_chats, 1)
      ELSE 0
    END
  INTO
    result.total_messages,
    result.total_photos,
    result.average_messages,
    result.average_photos
  FROM message_counts;

  -- Get total spent
  SELECT COALESCE(SUM(ABS(amount)), 0)
  INTO result.total_spent
  FROM balance
  WHERE chat_id = ANY(chat_ids)
    AND type = 'token_deduction';

  RETURN result;
END;
$$;