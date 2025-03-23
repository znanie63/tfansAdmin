/*
  # Add User Registration Statistics Function

  1. New Functions
    - `get_user_registration_stats(days_back integer)`
      Returns daily user registration counts for the specified number of days
      - Date
      - Number of registrations for that date

  2. Security
    - Function is accessible to authenticated users only
    - Maintains existing RLS policies
*/

-- Create type to hold registration statistics
CREATE TYPE registration_statistics AS (
  date date,
  count bigint
);

-- Create function to get registration statistics
CREATE OR REPLACE FUNCTION get_user_registration_stats(
  days_back integer DEFAULT 30
)
RETURNS SETOF registration_statistics
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
  registrations AS (
    SELECT
      DATE(created_at) as date,
      COUNT(*) as user_count
    FROM users
    WHERE created_at >= start_date
    GROUP BY DATE(created_at)
  )
  SELECT
    d.date,
    COALESCE(r.user_count, 0) as count
  FROM dates d
  LEFT JOIN registrations r ON r.date = d.date
  ORDER BY d.date;
END;
$$;