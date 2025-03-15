import { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2, Pencil, Check, X } from 'lucide-react';
import { useCategoryCounts } from '@/hooks/use-category-counts';
import { toast } from 'sonner';
import { getCategories, createCategory, deleteCategory, renameCategory, Category } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const { counts, loading: loadingCounts } = useCategoryCounts();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      setCreating(true);
      const category = await createCategory(newCategory.trim());
      setCategories(prev => [...prev, category]);
      setNewCategory('');
      toast.success('Category created successfully');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.id);
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
      setCategoryToDelete(null);
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategory({ id: category.id, name: category.name });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleSaveEdit = async () => {
    if (!editingCategory?.name.trim() || !editingCategory?.id) return;

    try {
      setSavingEdit(true);
      const updated = await renameCategory(editingCategory.id, editingCategory.name);
      setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
      setEditingCategory(null);
      toast.success('Category renamed successfully');
    } catch (error) {
      console.error('Error renaming category:', error);
      toast.error('Failed to rename category');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Model Categories</h2>
          <p className="text-sm text-muted-foreground">
            Manage categories for organizing models. Models without categories will appear in the "All Models" section of the app.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreateCategory} className="flex gap-2">
        <Input
          placeholder="Enter category name..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit" disabled={creating || !newCategory.trim()}>
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </>
          )}
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No categories found. Create your first category above.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {editingCategory?.id === category.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            className="h-8 w-[200px]"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={savingEdit || !editingCategory.name.trim()}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={savingEdit}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm">{category.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(category)}
                            className="ml-2 h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({counts[category.id] || 0} models)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCategoryToDelete(category)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category <span className="font-medium">"{categoryToDelete?.name}"</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-2 space-y-4">
            <p className="text-sm font-medium text-muted-foreground">This will:</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="block w-1.5 h-1.5 rounded-full bg-muted-foreground/70 mt-1.5 flex-shrink-0" />
                <span className="text-sm">Remove this category from all models that use it</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="block w-1.5 h-1.5 rounded-full bg-muted-foreground/70 mt-1.5 flex-shrink-0" />
                <span className="text-sm">Models will remain visible in the "All Models" section of the app</span>
              </div>
            </div>
            <div className="text-sm font-medium text-destructive bg-destructive/5 p-3 rounded-lg">
              Consider assigning models to other categories for better organization.
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteCategory}
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}