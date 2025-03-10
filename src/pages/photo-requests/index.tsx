import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { getPhotoRequests, updatePhotoRequestStatus } from '@/lib/photo-requests';
import { PhotoRequest, PhotoRequestStatus } from '@/types';
import { toast } from 'sonner';
import { Header } from './components/header';
import { Stats } from './components/stats';
import { StatusFilter } from './components/status-filter';
import { RequestList } from './components/request-list';

interface RequestStats {
  found: number;
  not_found: number;
  cancel: number;
  closed: number;
  totalSpent: number;
}

export function PhotoRequests() {
  const [requests, setRequests] = useState<PhotoRequest[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState<RequestStats>({
    found: 0,
    not_found: 0,
    cancel: 0,
    completed: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PhotoRequestStatus | 'all'>('all');

  const sortedRequests = useMemo(() => {
    const filtered = selectedStatus === 'all' 
      ? requests 
      : requests.filter(request => request.status === selectedStatus);

    return filtered.sort((a, b) => {
      // First sort by status priority
      const statusPriority = { found: 0, not_found: 1, cancel: 2, completed: 3 };
      const statusDiff = statusPriority[a.status] - statusPriority[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // Then sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [requests, selectedStatus]);

  useEffect(() => {
    loadRequests();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: requests } = await supabase
        .from('photo_requests')
        .select('status');

      const counts = (requests || []).reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const { data: balanceData } = await supabase
        .from('balance')
        .select('amount')
        .eq('type', 'token_deduction')
        .like('description', '%фото%');

      const totalSpent = balanceData?.reduce((sum, record) => sum + Math.abs(record.amount), 0) || 0;

      setStats({
        found: counts.found || 0,
        not_found: counts.not_found || 0,
        cancel: counts.cancel || 0,
        closed: counts.closed || 0,
        totalSpent
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      const { requests: data, hasMore: more } = await getPhotoRequests(1, 20, selectedStatus === 'closed');
      
      const modelIds = data.map(req => req.chat?.model.id).filter(Boolean);
      const { data: modelPrices } = await supabase
        .from('models')
        .select('id, price_photo')
        .in('id', modelIds);

      const transformedData = data.map(req => ({
        ...req,
        modelPhotoPrice: modelPrices?.find(m => m.id === req.chat?.model.id)?.price_photo || 0
      }));

      setRequests(transformedData);
      setHasMore(more);
      setPage(1);
    } catch (error) {
      console.error('Error loading photo requests:', error);
      toast.error('Failed to load photo requests');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreRequests = async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const { requests: newData, hasMore: more } = await getPhotoRequests(
        nextPage,
        20,
        selectedStatus === 'closed'
      );

      const modelIds = newData.map(req => req.chat?.model.id).filter(Boolean);
      const { data: modelPrices } = await supabase
        .from('models')
        .select('id, price_photo')
        .in('id', modelIds);

      const transformedData = newData.map(req => ({
        ...req,
        modelPhotoPrice: modelPrices?.find(m => m.id === req.chat?.model.id)?.price_photo || 0
      }));

      setRequests(prev => [...prev, ...transformedData]);
      setHasMore(more);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more photo requests:', error);
      toast.error('Failed to load more photo requests');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleStatusChange = async (requestId: string, status: PhotoRequestStatus) => {
    try {
      await updatePhotoRequestStatus(requestId, status);
      // Update stats locally
      setStats(prev => ({
        ...prev,
        [status]: prev[status] + 1,
        [requests.find(r => r.id === requestId)?.status || 'found']: prev[requests.find(r => r.id === requestId)?.status || 'found'] - 1
      }));
      
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status } : req
      ));
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Header />
      <Stats stats={stats} />
      <StatusFilter
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />
      <div className="pt-4">
        <RequestList
          requests={sortedRequests}
          onStatusChange={handleStatusChange}
          onLoadMore={loadMoreRequests}
          hasMore={hasMore}
          loading={loadingMore}
        />
      </div>
    </div>
  );
}