/*
  # Add Model Chart Statistics Function

  1. Changes
    - Add function to get daily chart statistics for a specific model
    - Returns daily counts of chats, messages, and photos
    - Data is aggregated by day for the last 7 days

  2. Security
    - Function is security definer to ensure consistent access
    - Uses proper search path for security
*/

-- Create type to hold daily statistics
CREATE TYPE daily_chat_statistics AS (
  date date,
  chats bigint,
  messages bigint,
  photos bigint
);

-- Create function to get daily chat statistics for a model
CREATE OR REPLACE FUNCTION get_model_daily_stats(
  model_id_param uuid,
  days_back integer DEFAULT 7
)
RETURNS SETOF daily_chat_statistics
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  start_date date;
BEGIN
  -- Calculate start date
  start_date := CURRENT_DATE - days_back;

  RETURN QUERY
  WITH RECURSIVE dates AS (
    SELECT start_date AS date
    UNION ALL
    SELECT date + 1
    FROM dates
    WHERE date < CURRENT_DATE
  ),
  chat_stats AS (
    SELECT
      DATE(created_at) as date,
      COUNT(*) as chat_count
    FROM chats
    WHERE model_id = model_id_param
      AND created_at >= start_date
    GROUP BY DATE(created_at)
  ),
  message_stats AS (
    SELECT
      DATE(m.created_at) as date,
      COUNT(*) FILTER (WHERE m.message_type = 'text') as message_count,
      COUNT(*) FILTER (WHERE m.message_type = 'image') as photo_count
    FROM messages m
    JOIN chats c ON c.id = m.chat_id
    WHERE c.model_id = model_id_param
      AND m.created_at >= start_date
      AND m.is_from_user = false
    GROUP BY DATE(m.created_at)
  )
  SELECT
    d.date,
    COALESCE(c.chat_count, 0) as chats,
    COALESCE(m.message_count, 0) as messages,
    COALESCE(m.photo_count, 0) as photos
  FROM dates d
  LEFT JOIN chat_stats c ON c.date = d.date
  LEFT JOIN message_stats m ON m.date = d.date
  ORDER BY d.date;
END;
$$;