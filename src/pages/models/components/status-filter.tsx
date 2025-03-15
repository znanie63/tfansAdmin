import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StatusFilterProps {
  selectedStatus: 'all' | 'active' | 'inactive';
  onStatusChange: (status: 'all' | 'active' | 'inactive') => void;
}

export function StatusFilter({ selectedStatus, onStatusChange }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedStatus === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('all')}
      >
        All Models
      </Button>
      <Button
        variant={selectedStatus === 'active' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('active')}
        className={selectedStatus === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
      >
        Active
      </Button>
      <Button
        variant={selectedStatus === 'inactive' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('inactive')}
        className={selectedStatus === 'inactive' ? 'bg-muted text-muted-foreground hover:bg-muted/80' : ''}
      >
        Inactive
      </Button>
    </div>
  );
}