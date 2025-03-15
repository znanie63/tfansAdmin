/*
  # Fix Category Deletion Behavior

  1. Changes
    - Modify foreign key constraint in model_category_assignments table
    - Change ON DELETE SET NULL to ON DELETE CASCADE for category_id
    - This ensures that when a category is deleted, its assignments are removed
    - The model profiles remain untouched

  2. Security
    - No changes to security policies
    - Maintains existing RLS policies
*/

-- First drop the existing foreign key constraint
ALTER TABLE model_category_assignments
DROP CONSTRAINT IF EXISTS model_category_assignments_category_id_fkey;

-- Re-create the constraint with CASCADE for assignments only
ALTER TABLE model_category_assignments
ADD CONSTRAINT model_category_assignments_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES model_categories(id)
ON DELETE CASCADE;