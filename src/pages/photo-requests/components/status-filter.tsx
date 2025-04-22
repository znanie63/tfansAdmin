import { Button } from '@/components/ui/button';
import { PhotoRequestStatus } from '@/types';

interface StatusFilterProps {
  selectedStatus: PhotoRequestStatus | 'all';
  onStatusChange: (status: PhotoRequestStatus | 'all') => void;
}

export function StatusFilter({ selectedStatus, onStatusChange }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 w-full overflow-hidden">
      <Button
        variant={selectedStatus === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('all')}
      >
        All Requests
      </Button>
      <Button
        variant={selectedStatus === 'found' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('found')}
        className={selectedStatus === 'found' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}
      >
        Found
      </Button>
      <Button
        variant={selectedStatus === 'not_found' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('not_found')}
        className={selectedStatus === 'not_found' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : ''}
      >
        Not Found
      </Button>
      <Button
        variant={selectedStatus === 'cancel' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('cancel')}
        className={selectedStatus === 'cancel' ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : ''}
      >
        Cancelled
      </Button>
      <Button
        variant={selectedStatus === 'completed' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('completed')}
        className={selectedStatus === 'completed' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
      >
        Completed
      </Button>
    </div>
  );
}