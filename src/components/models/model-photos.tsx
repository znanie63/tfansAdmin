import { useState } from 'react';
import { ImageIcon, X, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModelPhoto } from '@/types';
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

interface ModelPhotosProps {
  photos: ModelPhoto[];
  onCreatePhoto: () => void;
  onTogglePrivate: (photo: ModelPhoto) => void;
  onDeletePhoto: (photoId: string) => void;
}

export function ModelPhotos({ photos, onCreatePhoto, onTogglePrivate, onDeletePhoto }: ModelPhotosProps) {
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

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
                      alt="Model photo"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
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
                          onClick={() => onTogglePrivate(photo)}
                        >
                          {photo.isPrivate ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
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
    </div>
  );
}