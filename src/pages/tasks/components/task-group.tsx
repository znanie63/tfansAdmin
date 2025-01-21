import { Task } from '@/types';
import { TaskCard } from './task-card';

interface TaskGroupProps {
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleActive: (taskId: string, isActive: boolean) => void;
}

export function TaskGroup({ title, tasks, onEdit, onDelete, onToggleActive }: TaskGroupProps) {
  if (!tasks.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        ))}
      </div>
    </div>
  );
}