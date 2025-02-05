/*
  # Add initial admin user

  1. Changes
    - Insert initial admin user with ID 55cd2775-ec2b-4413-83e1-587f9a726951
*/

INSERT INTO admins (user_id, name, email, avatar)
VALUES (
  '55cd2775-ec2b-4413-83e1-587f9a726951',
  'Admin',
  'admin@example.com',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
)
ON CONFLICT (user_id) DO NOTHING;