/*
  # Fix Category Deletion Cascade

  1. Changes
    - Modify foreign key constraint in model_category_assignments table
    - Change ON DELETE CASCADE to ON DELETE SET NULL for category_id
    - This ensures that deleting a category only removes the category assignment, not the model

  2. Security
    - No changes to security policies
    - Maintains existing RLS policies
*/

-- First drop the existing foreign key constraint
ALTER TABLE model_category_assignments
DROP CONSTRAINT IF EXISTS model_category_assignments_category_id_fkey;

-- Re-create the constraint with SET NULL instead of CASCADE
ALTER TABLE model_category_assignments
ADD CONSTRAINT model_category_assignments_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES model_categories(id)
ON DELETE SET NULL;