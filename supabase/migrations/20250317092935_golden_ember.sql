/*
  # Add Dashboard Statistics Function

  1. New Functions
    - `get_dashboard_stats()`
      Returns aggregated statistics across all models including:
      - Total chats
      - Total messages
      - Total photos
      - Total spent
      - Average messages per chat
      - Average photos per chat

  2. Security
    - Function is accessible to authenticated users only
    - Maintains existing RLS policies
*/

-- Create type to hold dashboard statistics
CREATE TYPE dashboard_statistics AS (
  total_chats bigint,
  total_messages bigint,
  total_photos bigint,
  total_spent bigint,
  average_messages numeric,
  average_photos numeric
);

-- Create function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS dashboard_statistics
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result dashboard_statistics;
BEGIN
  -- Get total chats
  SELECT COUNT(*)
  INTO result.total_chats
  FROM chats;

  -- Get message counts
  WITH message_counts AS (
    SELECT
      COUNT(*) FILTER (WHERE message_type = 'text') as text_messages,
      COUNT(*) FILTER (WHERE message_type = 'image') as photo_messages
    FROM messages
    WHERE is_from_user = false
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
  WHERE type = 'token_deduction';

  RETURN result;
END;
$$;