import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StatusFilterProps {
  selectedStatus: 'all' | 'active' | 'inactive';
  counts: {
    all: number;
    active: number;
    inactive: number;
  };
  onStatusChange: (status: 'all' | 'active' | 'inactive') => void;
}

export function StatusFilter({ selectedStatus, counts, onStatusChange }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedStatus === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('all')}
        className="min-w-[120px]"
      >
        <span className="flex items-center gap-2">
          All Models
          <span className="px-1.5 py-0.5 text-xs rounded-md bg-muted/50">
            {counts.all}
          </span>
        </span>
      </Button>
      <Button
        variant={selectedStatus === 'active' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('active')}
        className={cn(
          "min-w-[120px]",
          selectedStatus === 'active' && "bg-green-500/10 text-green-500 hover:bg-green-500/20"
        )}
        className={selectedStatus === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
      >
        <span className="flex items-center gap-2">
          Active
          <span className="px-1.5 py-0.5 text-xs rounded-md bg-muted/50">
            {counts.active}
          </span>
        </span>
      </Button>
      <Button
        variant={selectedStatus === 'inactive' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('inactive')}
        className={cn(
          "min-w-[120px]",
          selectedStatus === 'inactive' && "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
        className={selectedStatus === 'inactive' ? 'bg-muted text-muted-foreground hover:bg-muted/80' : ''}
      >
        <span className="flex items-center gap-2">
          Inactive
          <span className="px-1.5 py-0.5 text-xs rounded-md bg-muted/50">
            {counts.inactive}
          </span>
        </span>
      </Button>
    </div>
  );
}