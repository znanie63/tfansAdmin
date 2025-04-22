import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Model, Category } from '@/types';
import { StatusFilter } from './components/status-filter';
import { CategoryFilter } from './components/category-filter';
import { getModels, createModel, updateModel, deleteModel, uploadModelImage } from '@/lib/models';
import { getCategories } from '@/lib/categories';
import { Header } from './components/header';
import { Search } from './components/search';
import { EmptyState } from './components/empty-state';
import { ModelGrid } from './components/model-grid';
import { EditDialog } from './components/edit-dialog';

interface CategoryCounts {
  [key: string]: number;
}

export function Models() {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showUncategorized, setShowUncategorized] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({});
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    active: 0,
    inactive: 0
  });
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add debug logging
  console.log('Models state:', { models, loading, error });

  useEffect(() => {
    const loadModels = async () => {
      try {
        setError(null);
        setLoading(true);
        const [data, categoriesData] = await Promise.all([
          getModels(),
          getCategories()
        ]);
        console.log('Fetched models:', data); // Debug log
        setModels(data);
        setCategories(categoriesData);

        // Calculate status counts
        const activeCount = data.filter(model => model.isActive).length;
        const inactiveCount = data.filter(model => !model.isActive).length;
        setStatusCounts({
          all: data.length,
          active: activeCount,
          inactive: inactiveCount
        });
        
        // Calculate category counts
        const counts: CategoryCounts = {};
        data.forEach(model => {
          if (!model.categories?.length) {
            counts['uncategorized'] = (counts['uncategorized'] || 0) + 1;
          } else {
            model.categories.forEach(category => {
              counts[category.id] = (counts[category.id] || 0) + 1;
            });
          }
        });
        setCategoryCounts(counts);
        
      } catch (error: any) {
        console.error('Error loading models:', error);
        setError(error.message || 'Failed to load models');
        toast.error('Failed to load models');
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  const refreshModels = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getModels();
      setModels(data);
    } catch (error: any) {
      console.error('Error refreshing models:', error);
      setError(error.message || 'Failed to refresh models');
      toast.error('Failed to refresh models');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = async (modelData: any) => {
    try {
      console.log('Creating model:', modelData);

      const newModel = await createModel(modelData);
      console.log('Model created successfully:', newModel);

      setModels(prev => [newModel, ...prev]);
      toast.success('Model profile created successfully');
      return true;
    } catch (error) {
      console.error('Error creating model:', error);
      const message = error instanceof Error ? error.message : 'Failed to create model profile';
      toast.error(message);
      return false;
    }
  };

  const handleEditModel = (model: Model) => {
    setEditingModel(model);
  };

  const handleUpdateModel = async (modelData: any) => {
    try {
      let imagePath = undefined;

      if (modelData.imageFile) {
        imagePath = await uploadModelImage(modelData.imageFile);
      }

      const model = await updateModel(modelData.id, {
        ...modelData,
        profileImage: imagePath || modelData.profileImage,
      } as any);

      // Refresh models from database after update
      await refreshModels();

      setEditingModel(null);
      toast.success('Model profile updated successfully');
    } catch (error) {
      toast.error('Failed to update model profile');
    }
  };

  const handleCreatePost = (model: Model) => {
    toast.info(`Creating post for ${model.firstName} ${model.lastName}`);
  };

  const handleDeleteModel = async (model: Model) => {
    try {
      await deleteModel(model.id);
      // Refresh models from database after deletion
      await refreshModels();
      toast.success('Model profile deleted successfully');
    } catch (error) {
      toast.error('Failed to delete model profile');
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredModels = models.filter(model => 
    (search.trim() ? 
      `${model.firstName} ${model.lastName}`.toLowerCase().includes(search.toLowerCase())
      : true) &&
    (selectedStatus === 'all' ? 
      true : 
      selectedStatus === 'active' ? 
        model.isActive : 
        !model.isActive) &&
    (showUncategorized ? 
      !model.categories?.length :
      selectedCategories.length === 0 ||
        selectedCategories.some(catId =>
          model.categories?.some(cat => cat.id === catId)
        ))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={refreshModels} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full space-y-8">
      <Header onCreateModel={handleCreateModel} />
      <div className="space-y-4">
        <Search 
          key="model-search"
          value={search} 
          onChange={setSearch} 
        />
        <div className="space-y-6">
            <StatusFilter
              selectedStatus={selectedStatus}
              counts={statusCounts}
              onStatusChange={setSelectedStatus}
            />
          
          <div className="pt-2 border-t">
            <CategoryFilter
              categories={categories}
              selectedCategories={selectedCategories}
              showUncategorized={showUncategorized}
              counts={categoryCounts}
              totalModels={statusCounts.all}
              onCategoryChange={handleCategoryChange}
              onUncategorizedChange={() => {
                setShowUncategorized(!showUncategorized);
                setSelectedCategories([]);
              }}
            />
          </div>
        </div>
      </div>
      
      {filteredModels.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {selectedStatus === 'inactive' && (
            <p className="text-sm text-muted-foreground text-center bg-muted/50 py-3 px-4 rounded-lg">
              These models and their posts are not visible in the mobile app
            </p>
          )}
          <ModelGrid
            key="model-grid"
            models={filteredModels}
            onEdit={handleEditModel}
            onDelete={handleDeleteModel}
            onCreatePost={handleCreatePost}
            isSubmitting={loading}
          />
        </div>
      )}

      <EditDialog
        key="edit-dialog"
        model={editingModel}
        onClose={() => setEditingModel(null)}
        onSubmit={handleUpdateModel}
      />
    </div>
  );
}