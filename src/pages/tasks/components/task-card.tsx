import { useState } from 'react';
import { Task } from '@/types';
import { ExternalLink, ChevronRight, Pencil, Users, Star, Trash2, Clock, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogTrigger,
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
import { cn } from '@/lib/utils';

const taskTypeIcons: Record<TaskType, any> = {
  social: ExternalLink,
  model_follow: Users,
  referral: Gift,
  review: Star,
  daily: Clock,
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleActive: (taskId: string, isActive: boolean) => void;
}

export function TaskCard({ task, onEdit, onDelete, onToggleActive }: TaskCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleToggle = (checked: boolean) => {
    onToggleActive(task.id, checked);
  };

  const Icon = taskTypeIcons[task.type];

  return (
    <>
      <Card 
        className="group relative hover:shadow-md transition-all cursor-pointer"
        onClick={() => setShowDetails(true)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="group-hover:text-primary transition-colors">
                  {task.title}
                </CardTitle>
              </div>
            </div>
            <Switch
              checked={task.status === 'active'}
              onCheckedChange={handleToggle}
              className="ml-2"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              <Gift className="h-4 w-4 mr-2 text-primary" />
              <div className="flex items-center gap-4">
                <span>Reward: <span className="font-medium">{task.reward} tokens</span></span>
                <span className="text-muted-foreground">•</span>
                <span>
                  <span className="font-medium">{task.completionsCount}</span> completions
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle>{task.title}</DialogTitle>
              <Badge variant={task.status === 'active' ? 'default' : 'secondary'}>
                {task.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </DialogHeader>
          
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={cn(
                "p-4 rounded-lg space-y-1",
                "bg-primary/5 border border-primary/10"
              )}>
                <h4 className="font-medium flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  Reward
                </h4>
                <p className="text-xl font-semibold">{task.reward} tokens</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {task.completionsCount} users completed this task
                </p>
              </div>

              {task.type === 'referral' && task.referralCount && task.referralReward && (
                <div className={cn(
                  "p-4 rounded-lg space-y-1",
                  "bg-secondary border border-secondary/50"
                )}>
                  <h4 className="font-medium">Referral Program</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {task.referralCount} referrals needed
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {task.referralReward} tokens per referral
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium mb-2">Task Type</h4>
                  <p className="text-sm text-muted-foreground capitalize">{task.type}</p>
                </div>

                {task.platform && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Platform</h4>
                    <p className="text-sm text-muted-foreground">{task.platform}</p>
                  </div>
                )}
              </div>

              {task.url && (
                <div>
                  <h4 className="text-sm font-medium mb-2">URL</h4>
                  <a 
                    href={task.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center"
                  >
                    {task.url}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium mb-2">Created</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(task.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Last Updated</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(task.updatedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end border-t pt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-8 px-3 text-sm"
                  onClick={() => {
                    setShowDetails(false);
                    onEdit(task);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Task
                </Button>
                <Button
                  variant="destructive"
                  className="h-8 px-3 text-sm"
                  onClick={() => {
                    setShowDetails(false);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone and will reset all user progress associated with this task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onDelete(task);
                setShowDeleteDialog(false);
              }}
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}