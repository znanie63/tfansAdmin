import { Badge } from '@/components/ui/badge';
import { Target, UserCircle, Star, Gift, Clock } from 'lucide-react';
import { TaskCompletionStats } from '@/lib/stats';

const taskTypeIcons: Record<string, any> = {
  social: Target,
  model_follow: UserCircle,
  review: Star,
  referral: Gift,
  daily: Clock,
};

const colors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

interface TaskTypeLabelsProps {
  data: TaskCompletionStats[];
}

export function TaskTypeLabels({ data }: TaskTypeLabelsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {data.map((task, index) => {
        const Icon = taskTypeIcons[task.taskType];
        return (
          <Badge
            key={`${task.taskType}-${task.taskName}-${index}`}
            variant="secondary"
            className="flex items-center gap-1.5"
            style={{ borderColor: colors[index % colors.length] }}
          >
            {Icon && <Icon className="h-3 w-3" />}
            {task.taskName}
          </Badge>
        );
      })}
    </div>
  );
}