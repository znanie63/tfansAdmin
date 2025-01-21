import { Button } from '@/components/ui/button';
import { TaskCompletionStats } from '@/lib/stats';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Target, UserCircle, Star, Gift, Clock } from 'lucide-react';

const taskTypeIcons: Record<string, any> = {
  social: Target,
  model_follow: UserCircle,
  review: Star,
  referral: Gift,
  daily: Clock,
};

const taskTypeLabels: Record<string, string> = {
  social: 'Social',
  model_follow: 'Model Follow',
  review: 'Review',
  referral: 'Referral',
  daily: 'Daily',
};

interface TaskTypeFilterProps {
  data: TaskCompletionStats[];
  selectedTypes: string[];
  onSelectedTypesChange: (types: string[]) => void;
}

export function TaskTypeFilter({ data, selectedTypes, onSelectedTypesChange }: TaskTypeFilterProps) {
  const types = useMemo(() => {
    const uniqueTypes = new Set<string>();
    data.forEach(task => uniqueTypes.add(task.taskType));
    return Array.from(uniqueTypes);
  }, [data]);

  const handleToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onSelectedTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onSelectedTypesChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {types.map(type => {
        const Icon = taskTypeIcons[type];
        const isSelected = selectedTypes.includes(type);
        
        return (
          <Button
            key={type}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-8',
              isSelected && 'bg-primary/10 hover:bg-primary/20 text-primary'
            )}
            onClick={() => handleToggle(type)}
          >
            {Icon && <Icon className="h-4 w-4 mr-2" />}
            {taskTypeLabels[type]}
          </Button>
        );
      })}
    </div>
  );
}