import { useState } from 'react';
import { ImageIcon, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
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
import { Story } from '@/types';

interface ModelStoriesProps {
  stories: Story[];
  onCreateStory: () => void;
  onDeleteStory: (storyId: string) => void;
}

function getTimeAgo(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function ModelStories({ stories, onCreateStory, onDeleteStory }: ModelStoriesProps) {
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);

  return (
    <div className="min-w-0 w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <div>
          <h2 className="text-lg font-semibold">Active Stories</h2>
          <p className="text-sm text-muted-foreground">View and manage stories</p>
        </div>
        <Button onClick={onCreateStory} size="default" className="w-full sm:w-auto">
          <ImageIcon className="h-4 w-4 mr-2" />
          <span className="whitespace-nowrap">Create Story</span>
        </Button>
      </div>
      <div className="min-w-0 w-full">
        <div className={cn(
          "min-w-0 w-full",
          stories.length > 0 && "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
        )}>
          {stories.length > 0 ? (
            stories.map((story, index) => (
              <Card 
                key={story.id}
                className="group hover:shadow-lg transition-all"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="aspect-[9/16] rounded-lg bg-muted overflow-hidden relative">
                    <img
                      src={story.image}
                      alt="Story"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                      Posted
                    </Badge>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {getTimeAgo(story.createdAt)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setStoryToDelete(story.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="w-full">
              <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No active stories</h3>
                <p className="mt-2 text-sm text-center text-muted-foreground max-w-[420px]">
                  Share temporary updates and highlights with your audience by creating a new story.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <AlertDialog open={!!storyToDelete} onOpenChange={() => setStoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this story? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (storyToDelete) {
                  onDeleteStory(storyToDelete);
                  setStoryToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}