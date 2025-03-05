import { Button } from '@/components/ui/button';
import { PhotoRequestStatus } from '@/types';

interface StatusFilterProps {
  selectedStatus: PhotoRequestStatus | 'all';
  onStatusChange: (status: PhotoRequestStatus | 'all') => void;
}

export function StatusFilter({ selectedStatus, onStatusChange }: StatusFilterProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b">
      <div className="flex flex-wrap gap-2">
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
        className="text-emerald-500"
      >
        Found
      </Button>
      <Button
        variant={selectedStatus === 'not_found' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('not_found')}
        className="text-amber-500"
      >
        Not Found
      </Button>
      <Button
        variant={selectedStatus === 'cancel' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('cancel')}
        className="text-red-500"
      >
        Cancelled
      </Button>
      <Button
        variant={selectedStatus === 'completed' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('completed')}
        className="text-green-500"
      >
        Completed
      </Button>
    </div>
    </div>
  );
}