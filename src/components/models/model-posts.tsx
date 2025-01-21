import { useState } from 'react';
import { Post } from '@/types';
import { MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ModelPostsProps {
  posts: Post[];
  onCreatePost: () => void;
  onDeletePost: (postId: string) => void;
}

export function ModelPosts({ posts, onCreatePost, onDeletePost }: ModelPostsProps) {
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleConfirmDelete = () => {
    if (postToDelete) {
      onDeletePost(postToDelete);
      setPostToDelete(null);
    }
  };

  return (
    <div className="min-w-0 w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <div>
          <h2 className="text-lg font-semibold">Recent Posts</h2>
          <p className="text-sm text-muted-foreground">Manage and create new posts</p>
        </div>
        <Button onClick={onCreatePost} size="default" className="w-full sm:w-auto">
          <MessageSquare className="h-4 w-4 mr-2" />
          <span className="whitespace-nowrap">Create Post</span>
        </Button>
      </div>
      <div className="min-w-0 w-full">
        <div className={cn(
          "min-w-0 w-full",
          posts.length > 0 && "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
        )}>
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <Card 
                key={post.id}
                className="group hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="aspect-[4/3] rounded-lg bg-muted overflow-hidden">
                    <img
                      src={post.image}
                      alt="Post preview"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="line-clamp-2 text-sm">
                      {post.text}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPostToDelete(post.id);
                        }}
                        className="text-destructive hover:text-destructive"
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
                <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No posts yet</h3>
                <p className="mt-2 text-sm text-center text-muted-foreground max-w-[420px]">
                  Create your first post by clicking the button above. Share photos and updates with your audience.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
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

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selectedPost && (
            <div className="relative flex flex-col md:flex-row">
              <DialogHeader className="sr-only">
                <DialogTitle>View Post</DialogTitle>
              </DialogHeader>
              <div className="flex-1 min-w-0 md:max-w-[60%]">
                <img
                  src={selectedPost.image}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 p-6">
                <div className="space-y-4">
                  <p className="text-base leading-relaxed">
                    {selectedPost.text}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Posted on {new Date(selectedPost.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}