import { useNavigate } from 'react-router-dom';
import { Model } from '@/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MessageSquare, ImageIcon, Pencil, Trash2, Video } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ModelCardProps {
  model: Model;
  onEdit: (model: Model) => void;
  onDelete: (model: Model) => void;
  onCreatePost: (model: Model) => void;
}

export function ModelCard({ model, onEdit, onDelete, onCreatePost }: ModelCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const handleEdit = () => {
    onEdit(model);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    if ((e.target as HTMLElement).closest('.card-actions')) {
      return;
    }
    navigate(`/models/${model.id}`);
  };

  return (
    <>
      <Card 
        className={cn(
          "group h-full flex flex-col hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer",
          !model.isActive && "opacity-75"
        )}
        onClick={handleClick}
      >
        <CardHeader className="p-3 sm:p-4 relative">
          <div className="card-actions absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 bg-background hover:bg-secondary/80 border shadow-sm transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
            >
              <Pencil className="h-4 w-4 text-foreground/70" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 bg-background hover:bg-secondary/80 border shadow-sm transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              <Trash2 className="h-4 w-4 text-foreground/70" />
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar className="h-14 w-14 sm:h-12 sm:w-12 ring-2 ring-muted group-hover:ring-primary/50 transition-colors">
              <AvatarImage
                src={model.profileImage} 
                alt={`${model.firstName} ${model.lastName}`}
                className="object-cover"
              />
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold truncate mb-1 group-hover:text-primary transition-colors">
                {model.firstName} {model.lastName}
              </h3>
              <CardDescription className="text-sm line-clamp-2">
                {model.quote}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{model.postCount || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>{model.photoCount || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Video className="h-3.5 w-3.5" />
                <span>{model.videoCount || 0}</span>
              </div>
            </div>
            <Badge variant="secondary" className={cn(
              model.isActive 
                ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}>
              {model.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {model.firstName} {model.lastName}'s profile? 
              This action cannot be undone and will permanently remove all associated data including posts and stories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onDelete(model);
                setShowDeleteDialog(false);
              }}
            >
              Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}