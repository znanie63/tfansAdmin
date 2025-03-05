import { useState } from 'react';
import { ImageIcon, X, Lock, Unlock, Hash, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModelPhoto } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ModelPhotosProps {
  photos: ModelPhoto[];
  onCreatePhoto: () => void;
  onTogglePrivate: (photo: ModelPhoto) => void;
  onUpdateDescription: (photo: ModelPhoto, description: string) => void;
  onDeletePhoto: (photoId: string) => void;
}

export function ModelPhotos({ photos, onCreatePhoto, onTogglePrivate, onUpdateDescription, onDeletePhoto }: ModelPhotosProps) {
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<ModelPhoto | null>(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditDescription = (photo: ModelPhoto) => {
    setEditingPhoto(photo);
    setEditedDescription(photo.description);
  };

  const handleSaveDescription = async () => {
    if (!editingPhoto) return;
    
    try {
      setIsSubmitting(true);
      await onUpdateDescription(editingPhoto, editedDescription);
      setEditingPhoto(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = () => {
    if (photoToDelete) {
      onDeletePhoto(photoToDelete);
      setPhotoToDelete(null);
    }
  };

  return (
    <div className="min-w-0 w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <div>
          <h2 className="text-lg font-semibold">Model Photos</h2>
          <p className="text-sm text-muted-foreground">Manage model's photo gallery</p>
        </div>
        <Button onClick={onCreatePhoto} size="default" className="w-full sm:w-auto">
          <ImageIcon className="h-4 w-4 mr-2" />
          <span className="whitespace-nowrap">Add Photo</span>
        </Button>
      </div>

      <div className="min-w-0 w-full">
        <div className={cn(
          "min-w-0 w-full",
          photos.length > 0 && "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
        )}>
          {photos.length > 0 ? (
            photos.map((photo) => (
              <Card 
                key={photo.id}
                className="group hover:shadow-lg transition-all"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="aspect-[4/3] rounded-lg bg-muted overflow-hidden relative">
                    <img
                      src={photo.image}
                      alt={photo.description || "Model photo"}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          photo.isPrivate 
                            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        )}
                      >
                        {photo.isPrivate ? 'Private' : 'Public'}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => handleEditDescription(photo)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setPhotoToDelete(photo.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {photo.description && (
                      <div className="flex items-start gap-1.5 mt-2">
                        <Hash className="h-3.5 w-3.5 text-primary mt-1" />
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {photo.description}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="w-full">
              <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No photos yet</h3>
                <p className="mt-2 text-sm text-center text-muted-foreground max-w-[420px]">
                  Add photos to the model's gallery by clicking the button above.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={!!photoToDelete} onOpenChange={() => setPhotoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editingPhoto} onOpenChange={() => setEditingPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Photo Keywords</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="relative aspect-[4/3] md:aspect-[3/4] rounded-lg overflow-hidden bg-muted/50">
              {editingPhoto && (
                <img
                  src={editingPhoto.image}
                  alt="Edit photo"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" />
                  <Label>Keywords</Label>
                </div>
                <Textarea
                  placeholder="Add search keywords separated by commas (e.g., beach, sunset, casual, summer)"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="h-48 md:h-[calc(100vh-400px)] min-h-[200px] resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSaveDescription}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                      Saving...
                    </>
                  ) : (
                    'Save Keywords'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingPhoto(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}