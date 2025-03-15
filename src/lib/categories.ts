import { supabase } from './supabase';

export interface Category {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryRecord {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

function transformCategoryFromDB(record: CategoryRecord): Category {
  return {
    id: record.id,
    name: record.name,
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at)
  };
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('model_categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }

  return (data as CategoryRecord[]).map(transformCategoryFromDB);
}

export async function createCategory(name: string): Promise<Category> {
  const { data, error } = await supabase
    .from('model_categories')
    .insert({ name })
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw new Error('Failed to create category');
  }

  return transformCategoryFromDB(data as CategoryRecord);
}

export async function renameCategory(id: string, name: string): Promise<Category> {
  const { data, error } = await supabase
    .from('model_categories')
    .update({ name: name.trim() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error renaming category:', error);
    throw new Error('Failed to rename category');
  }

  return transformCategoryFromDB(data as CategoryRecord);
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('model_categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw new Error('Failed to delete category');
  }
}

export async function assignCategories(modelId: string, categoryIds: string[]): Promise<void> {
  try {
    if (!modelId) {
      throw new Error('Model ID is required');
    }

    // Filter out any null/undefined/empty values
    const validCategoryIds = (Array.isArray(categoryIds) ? categoryIds : [])
      .filter(id => typeof id === 'string' && id.trim() !== '');

    console.log('Assigning categories:', { modelId, validCategoryIds });

    // First remove existing assignments
    const { error: deleteError } = await supabase
      .from('model_category_assignments')
      .delete()
      .eq('model_id', modelId);

    if (deleteError) {
      console.error('Error removing category assignments:', deleteError);
      throw new Error('Failed to update category assignments');
    }

    // Then add new assignments
    if (validCategoryIds.length > 0) {
      console.log('Inserting category assignments:', validCategoryIds);

      const { error: insertError } = await supabase
        .from('model_category_assignments')
        .insert(
          validCategoryIds.map(categoryId => ({
            model_id: modelId,
            category_id: categoryId
          }))
        );

      if (insertError) {
        console.error('Error adding category assignments:', insertError);
        throw new Error('Failed to update category assignments');
      }
    }
  } catch (error) {
    console.error('Error assigning categories:', error);
    throw error;
  }
}

export async function getModelCategories(modelId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('model_category_assignments')
    .select(`
      category:model_categories (
        id,
        name,
        created_at,
        updated_at
      )
    `)
    .eq('model_id', modelId);

  if (error) {
    console.error('Error fetching model categories:', error);
    throw new Error('Failed to fetch model categories');
  }

  return data.map(record => transformCategoryFromDB(record.category));
}