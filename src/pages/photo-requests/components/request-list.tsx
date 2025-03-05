import { Image } from 'lucide-react';
import { PhotoRequest, PhotoRequestStatus } from '@/types';
import { RequestCard } from './request-card';

interface RequestListProps {
  requests: PhotoRequest[];
  onStatusChange: (requestId: string, status: PhotoRequestStatus) => void;
}

export function RequestList({ requests, onStatusChange }: RequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Image className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No photo requests</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Photo requests from users will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}