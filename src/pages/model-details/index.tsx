import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  MessageSquare,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModelForm } from '@/components/models/model-form';
import { ModelProfile } from '@/components/models/model-profile';
import { ModelPosts } from '@/components/models/model-posts';
import { ModelStories } from '@/components/models/model-stories';
import { ModelPhotos } from '@/components/models/model-photos';
import { ModelPhotoForm } from '@/components/models/model-photo-form';
import { PostForm } from '@/components/posts/post-form';
import { StoryForm } from '@/components/stories/story-form';
import { Model, Post, Story, ModelPhoto } from '@/types';
import { getModelPosts, createPost, deletePost, uploadPostImage } from '@/lib/posts';
import { getModelStories, createStory, deleteStory, uploadStoryImage } from '@/lib/stories';
import { getModelPhotos, createModelPhoto, updateModelPhoto, deleteModelPhoto, uploadModelPhoto } from '@/lib/models';
import { toast } from 'sonner';
import { getModel, updateModel, deleteModel } from '@/lib/models';

export function ModelDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [photos, setPhotos] = useState<ModelPhoto[]>([]);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);
  const [isSubmittingPhoto, setIsSubmittingPhoto] = useState(false);
  const [isCreatingPhoto, setIsCreatingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => navigate(-1);

  useEffect(() => {
    const loadModel = async () => {
      try {
        if (!id) {
          setError('No model ID provided');
          return;
        }

        const modelData = await getModel(id);
        setModel(modelData);
        
        // Load posts and stories
        const [postsData, storiesData, photosData] = await Promise.all([
          getModelPosts(id),
          getModelStories(id),
          getModelPhotos(id)
        ]);
        
        setPosts(postsData);
        setStories(storiesData);
        setPhotos(photosData);
      } catch (err) {
        console.error('Error loading model:', err);
        toast.error('Failed to load model');
        navigate('/models');
      } finally {
        setLoading(false);
      }
    };

    loadModel();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{error || 'Model not found'}</p>
      </div>
    );
  }
  const handleUpdateModel = async (modelData: any) => {
    try {
      if (!model?.id) return;
      
      const updatedModel = await updateModel(model.id, modelData);
      setModel(updatedModel);
      setShowEditDialog(false);
      toast.success('Model profile updated successfully');
    } catch (error) {
      console.error('Error updating model:', error);
      toast.error('Failed to update model profile');
    }
  };

  const handleCreatePost = () => {
    setIsCreatingPost(true);
  };

  const handleSubmitPost = async (data: { imageFile: File; text: string }) => {
    try {
      if (!model) return;
      setIsSubmittingPost(true);
      console.log('Creating post with data:', data);

      const imagePath = await uploadPostImage(data.imageFile);
      console.log('Uploaded image path:', imagePath);

      const newPost = await createPost(model.id, {
        image: imagePath,
        text: data.text
      });
      console.log('Created post:', newPost);

      setPosts(prev => [newPost, ...prev]);
      setIsCreatingPost(false);
      toast.success('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', { error, data });
      toast.error('Failed to create post');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleSubmitStory = async (data: { imageFile: File }) => {
    try {
      if (!model) return;
      setIsSubmittingStory(true);

      const imagePath = await uploadStoryImage(data.imageFile);
      const newStory = await createStory(model.id, {
        image: imagePath
      });

      setStories(prev => [newStory, ...prev]);
      setIsCreatingStory(false);
      toast.success('Story created successfully');
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error('Failed to create story');
    } finally {
      setIsSubmittingStory(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await deleteStory(storyId);
      setStories(prev => prev.filter(story => story.id !== storyId));
      toast.success('Story deleted successfully');
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete story');
    }
  };

  const handleCreatePhoto = () => {
    setIsCreatingPhoto(true);
  };

  const handleSubmitPhoto = async (data: { imageFiles: File[] }) => {
    try {
      if (!model) return;
      setIsSubmittingPhoto(true);

      // Upload all photos in parallel
      const uploadPromises = data.imageFiles.map(async ({ file, description }) => {
        const imagePath = await uploadModelPhoto(file);
        return createModelPhoto(model.id, { 
          image: imagePath,
          description: description.trim()
        });
      });

      const newPhotos = await Promise.all(uploadPromises);

      setPhotos(prev => [...newPhotos, ...prev]);
      setIsCreatingPhoto(false);
      toast.success(`${newPhotos.length} photos uploaded successfully`);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsSubmittingPhoto(false);
    }
  };

  const handleTogglePhotoPrivate = async (photo: ModelPhoto) => {
    try {
      const updatedPhoto = await updateModelPhoto(photo.id, {
        isPrivate: !photo.isPrivate,
      });
      setPhotos(prev => prev.map(p => 
        p.id === updatedPhoto.id ? updatedPhoto : p
      ));
      toast.success('Photo visibility updated');
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error('Failed to update photo');
    }
  };

  const handleUpdatePhotoDescription = async (photo: ModelPhoto, description: string) => {
    try {
      const updatedPhoto = await updateModelPhoto(photo.id, {
        description: description.trim(),
      });
      setPhotos(prev => prev.map(p => 
        p.id === updatedPhoto.id ? updatedPhoto : p
      ));
      toast.success('Photo keywords updated');
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error('Failed to update photo');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deleteModelPhoto(photoId);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      toast.success('Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  const handleDeleteModel = async () => {
    try {
      if (!model?.id) return;
      
      await deleteModel(model.id);
      navigate('/models');
      toast.success('Model profile deleted successfully');
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error('Failed to delete model profile');
    }
  };

  if (!model) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Model not found</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center gap-4 h-16 px-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="h-9 px-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="ml-2 text-sm hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold truncate">
            {model.firstName} {model.lastName}
          </h1>
        </div>
      </div>

      <div className="flex-1 grid gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] 2xl:grid-cols-[360px_1fr] w-full">
        <div className="space-y-6">
          <div className="sticky top-[80px] mt-6">
            <ModelProfile
              model={model}
              onEdit={() => setShowEditDialog(true)}
              onDelete={handleDeleteModel}
            />
          </div>
        </div>
        <div className="flex-1 w-full min-w-0">
          <Tabs defaultValue="posts" className="w-full mt-6">
            <div className="sticky top-[80px] z-10 bg-background/95 backdrop-blur-sm pb-4">
              <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-background/95 to-transparent" />
              <TabsList className="w-full h-12 sm:h-14 bg-card rounded-lg p-1 border shadow-sm">
                <TabsTrigger value="posts" className="flex-1 h-10 sm:h-12">
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">Posts</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="stories" className="flex-1 h-10 sm:h-12">
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="font-medium">Stories</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="photos" className="flex-1 h-10 sm:h-12">
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="font-medium">Photos</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              <div className="absolute inset-x-0 -bottom-4 h-4 bg-gradient-to-b from-background/95 to-transparent" />
            </div>
            <TabsContent value="posts" className="w-full min-h-[400px]">
              <ModelPosts 
                posts={posts} 
                onCreatePost={handleCreatePost} 
                onDeletePost={handleDeletePost} 
              />
            </TabsContent>
            <TabsContent value="stories" className="w-full min-h-[400px]">
              <ModelStories
                stories={stories}
                onCreateStory={() => setIsCreatingStory(true)}
                onDeleteStory={handleDeleteStory}
              />
            </TabsContent>
            <TabsContent value="photos" className="w-full min-h-[400px]">
              <ModelPhotos
                photos={photos}
                onCreatePhoto={handleCreatePhoto}
                onTogglePrivate={handleTogglePhotoPrivate}
                onUpdateDescription={handleUpdatePhotoDescription}
                onDeletePhoto={handleDeletePhoto}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Model Profile</DialogTitle>
          </DialogHeader>
          <ModelForm
            initialData={model}
            onSubmit={handleUpdateModel}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <PostForm
            isSubmitting={isSubmittingPost}
            onSubmit={handleSubmitPost}
            onCancel={() => setIsCreatingPost(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isCreatingStory} onOpenChange={setIsCreatingStory}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Story</DialogTitle>
          </DialogHeader>
          <StoryForm
            isSubmitting={isSubmittingStory}
            onSubmit={handleSubmitStory}
            onCancel={() => setIsCreatingStory(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isCreatingPhoto} onOpenChange={setIsCreatingPhoto}>
        <DialogContent className={cn(
          "max-w-4xl",
          photos.length === 0 && "max-w-lg"
        )}>
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
          </DialogHeader>
          <ModelPhotoForm
            isSubmitting={isSubmittingPhoto}
            onSubmit={handleSubmitPhoto}
            onCancel={() => setIsCreatingPhoto(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}