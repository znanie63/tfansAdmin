import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Model } from '@/types';
import { getModels, createModel, updateModel, deleteModel, uploadModelImage } from '@/lib/models';
import { Header } from './components/header';
import { Search } from './components/search';
import { EmptyState } from './components/empty-state';
import { ModelGrid } from './components/model-grid';
import { EditDialog } from './components/edit-dialog';

export function Models() {
  const [search, setSearch] = useState('');
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
        const data = await getModels();
        console.log('Fetched models:', data); // Debug log
        setModels(data);
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
      let imagePath = undefined;
      console.log('Creating model with data:', modelData); // Debug log

      if (modelData.imageFile) {
        imagePath = await uploadModelImage(modelData.imageFile);
      }

      await createModel({
        ...modelData,
        profileImage: imagePath || '',
      } as any);

      // Refresh models from database after creation
      await refreshModels();
      console.log('Models after refresh:', models); // Debug log

      toast.success('Model profile created successfully');
    } catch (error) {
      console.error('Error creating model:', error);
      toast.error('Failed to create model profile');
      throw error;
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

  const filteredModels = models.filter(model => 
    `${model.firstName} ${model.lastName}`.toLowerCase().includes(search.toLowerCase())
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
      <Search 
        key="model-search"
        value={search} 
        onChange={setSearch} 
      />
      
      {filteredModels.length === 0 ? (
        <EmptyState />
      ) : (
        <ModelGrid
          key="model-grid"
          models={filteredModels}
          onEdit={handleEditModel}
          onDelete={handleDeleteModel}
          onCreatePost={handleCreatePost}
        />
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