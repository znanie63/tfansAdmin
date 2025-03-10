import { Image } from 'lucide-react';
import { useRef, useCallback } from 'react';
import { PhotoRequest, PhotoRequestStatus } from '@/types';
import { RequestCard } from './request-card';

interface RequestListProps {
  requests: PhotoRequest[];
  onStatusChange: (requestId: string, status: PhotoRequestStatus) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

export function RequestList({
  requests,
  onStatusChange,
  onLoadMore,
  hasMore,
  loading
}: RequestListProps) {
  const observerRef = useRef<IntersectionObserver>();
  const lastRequestRef = useRef<HTMLDivElement>(null);

  const lastRequestCallback = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, hasMore, onLoadMore]);

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
      {requests.map((request, index) => (
        <div
          key={request.id}
          ref={index === requests.length - 1 ? lastRequestCallback : null}
        >
          <RequestCard
            request={request}
            onStatusChange={onStatusChange}
          />
        </div>
      ))}
      {loading && (
        <div className="col-span-full flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}