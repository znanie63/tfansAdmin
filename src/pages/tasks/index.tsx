import { useState, useEffect } from 'react';
import { Plus, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Task } from '@/types';
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/tasks';
import { TaskCard } from './components/task-card';
import { TaskGroup } from './components/task-group';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskForm } from './components/task-form';

export function Tasks() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = (taskId: string, isActive: boolean) => {
    if (!tasks) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Check if trying to activate a daily task when one already exists
    if (task.type === 'daily' && isActive) {
      const existingDailyTask = tasks.find(t => 
        t.type === 'daily' && 
        t.status === 'active' && 
        t.id !== taskId
      );
      
      if (existingDailyTask) {
        toast.error('Only one daily task can be active at a time. Please deactivate the existing daily task first.');
        return;
      }
    }

    updateTask(taskId, {
      ...task,
      status: isActive ? 'active' : 'inactive'
    })
      .then(() => {
        setTasks(prev => prev?.map(t =>
          t.id === taskId
            ? { ...t, status: isActive ? 'active' : 'inactive' }
            : t
        ) || null);
        toast.success(`Task ${isActive ? 'activated' : 'deactivated'}`);
      })
      .catch(() => {
        const message = error?.message || 'Failed to update task status';
        toast.error(message);
      });
  };

  const handleCreateTask = async (data: Partial<Task>) => {
    try {
      const newTask = await createTask(data as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
      setTasks(prev => prev ? [newTask, ...prev] : [newTask]);
      setShowCreateDialog(false);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleEditTask = async (data: Task) => {
    try {
      if (!editingTask?.id) {
        console.error('No task ID provided for update');
        toast.error('Failed to update task: Missing ID');
        return;
      }

      const updatedTask = await updateTask(data.id, data);
      setTasks(prev => prev?.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      ) || null);
      setEditingTask(null);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      await deleteTask(task.id);
      setTasks(prev => prev?.filter(t => t.id !== task.id) || null);
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tasks) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Failed to load tasks</p>
      </div>
    );
  }

  const activeTasks = tasks.filter(task => task.status === 'active');
  const inactiveTasks = tasks.filter(task => task.status === 'inactive');

  const groupedActiveTasks = {
    daily: activeTasks.filter(task => task.type === 'daily'),
    social: activeTasks.filter(task => task.type === 'social'),
    referral: activeTasks.filter(task => task.type === 'referral'),
    review: activeTasks.filter(task => task.type === 'review'),
  };

  const taskTypeLabels = {
    daily: 'Daily Tasks',
    social: 'Social Media Tasks',
    referral: 'Referral Tasks',
    review: 'Review Tasks',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-primary/80" />
          <h1 className="text-2xl sm:text-3xl font-bold">Tasks</h1>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="lg" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        Create and manage tasks for users to earn TFC tokens. These tasks will be displayed in the mobile app.
      </p>

      <div className="space-y-8">
        {activeTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Active Tasks</h2>
            {Object.entries(groupedActiveTasks).map(([type, tasks]) => (
              <TaskGroup
                key={type}
                title={taskTypeLabels[type as keyof typeof taskTypeLabels]}
                tasks={tasks}
                onEdit={setEditingTask}
                onDelete={handleDeleteTask}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}

        {inactiveTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Inactive Tasks</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inactiveTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={setEditingTask}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm
              initialData={editingTask}
              onSubmit={(data) => handleEditTask({ ...data, id: editingTask.id } as Task)}
              onCancel={() => setEditingTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}