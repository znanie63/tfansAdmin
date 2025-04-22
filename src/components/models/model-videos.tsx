import { useState } from 'react';
import { Video, X, Lock, Unlock, Hash, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModelVideo } from '@/types';
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

interface ModelVideosProps {
  videos: ModelVideo[];
  onCreateVideo: () => void;
  onTogglePrivate: (video: ModelVideo) => void;
  onUpdateDescription: (video: ModelVideo, description: string) => void;
  onDeleteVideo: (videoId: string) => void;
}

export function ModelVideos({ videos, onCreateVideo, onTogglePrivate, onUpdateDescription, onDeleteVideo }: ModelVideosProps) {
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<ModelVideo | null>(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditDescription = (video: ModelVideo) => {
    setEditingVideo(video);
    setEditedDescription(video.description);
  };

  const handleSaveDescription = async () => {
    if (!editingVideo) return;
    
    try {
      setIsSubmitting(true);
      await onUpdateDescription(editingVideo, editedDescription);
      setEditingVideo(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = () => {
    if (videoToDelete) {
      onDeleteVideo(videoToDelete);
      setVideoToDelete(null);
    }
  };

  return (
    <div className="min-w-0 w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <div>
          <h2 className="text-lg font-semibold">Model Videos</h2>
          <p className="text-sm text-muted-foreground">Manage model's video gallery</p>
        </div>
        <Button onClick={onCreateVideo} size="default" className="w-full sm:w-auto">
          <Video className="h-4 w-4 mr-2" />
          <span className="whitespace-nowrap">Add Video</span>
        </Button>
      </div>

      <div className="min-w-0 w-full">
        <div className={cn(
          "min-w-0 w-full",
          videos.length > 0 && "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
        )}>
          {videos.length > 0 ? (
            videos.map((video) => (
              <Card 
                key={video.id}
                className="group hover:shadow-lg transition-all"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="aspect-[9/16] rounded-lg bg-muted overflow-hidden relative">
                    <video
                      src={video.video}
                      className="w-full h-full object-cover"
                      controls
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          video.isPrivate 
                            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        )}
                      >
                        {video.isPrivate ? 'Private' : 'Public'}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => handleEditDescription(video)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setVideoToDelete(video.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {video.description && (
                      <div className="flex items-start gap-1.5 mt-2">
                        <Hash className="h-3.5 w-3.5 text-primary mt-1" />
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {video.description}
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
                <Video className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No videos yet</h3>
                <p className="mt-2 text-sm text-center text-muted-foreground max-w-[420px]">
                  Add videos to the model's gallery by clicking the button above.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={!!videoToDelete} onOpenChange={() => setVideoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
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

      <Dialog open={!!editingVideo} onOpenChange={() => setEditingVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Video Keywords</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-muted/50">
              {editingVideo && (
                <video
                  src={editingVideo.video}
                  className="w-full h-full object-cover"
                  controls
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
                  onClick={() => setEditingVideo(null)}
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