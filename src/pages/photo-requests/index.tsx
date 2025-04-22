import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { getPhotoRequests, updatePhotoRequestStatus, getVideoRequests, updateVideoRequestStatus } from '@/lib/photo-requests';
import { PhotoRequest, PhotoRequestStatus, VideoRequest, VideoRequestStatus } from '@/types'; 
import { toast } from 'sonner';
import { Header } from './components/header';
import { Stats } from './components/stats';
import { StatusFilter } from './components/status-filter';
import { RequestList } from './components/request-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface RequestStats {
  found: number;
  not_found: number;
  cancel: number;
  completed: number; 
  totalSpent: number;
}

interface PhotoVideoStats {
  photo: RequestStats;
  video: RequestStats;
}

interface CombinedStats {
  found: number;
  not_found: number;
  cancel: number;
  closed: number;
  totalSpent: number;
}

export function PhotoRequests() {
  const [requests, setRequests] = useState<PhotoRequest[]>([]);
  const [videoRequests, setVideoRequests] = useState<VideoRequest[]>([]);
  const [page, setPage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const [stats, setStats] = useState<PhotoVideoStats>({
    photo: {
      found: 0,
      not_found: 0,
      cancel: 0,
      completed: 0,
      totalSpent: 0
    },
    video: {
      found: 0,
      not_found: 0,
      cancel: 0,
      completed: 0,
      totalSpent: 0
    }
  });
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PhotoRequestStatus | 'all'>('all');
  const [selectedVideoStatus, setSelectedVideoStatus] = useState<VideoRequestStatus | 'all'>('all');

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

  const sortedVideoRequests = useMemo(() => {
    const filtered = selectedVideoStatus === 'all' 
      ? videoRequests 
      : videoRequests.filter(request => request.status === selectedVideoStatus);

    return filtered.sort((a, b) => {
      // First sort by status priority
      const statusPriority = { found: 0, not_found: 1, cancel: 2, completed: 3 };
      const statusDiff = statusPriority[a.status] - statusPriority[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // Then sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [videoRequests, selectedVideoStatus]);

  useEffect(() => {
    loadRequests();
    loadStats();
    loadVideoRequests();
  }, []);

  const loadVideoRequests = async () => {
    try {
      const { requests: data, hasMore: more } = await getVideoRequests(1, 20, selectedVideoStatus === 'closed');
      setVideoRequests(data);
      setHasMoreVideos(more);
      setVideoPage(1);
    } catch (error) {
      console.error('Error loading video requests:', error);
      toast.error('Failed to load video requests');
    }
  };

  const loadStats = async () => {
    try {
      const { data: requests } = await supabase
        .from('photo_requests') 
        .select('status, id')
        .not('status', 'eq', null);

      const { data: videoRequestsData } = await supabase
        .from('video_requests')
        .select('status, id')
        .not('status', 'eq', null);

      const photoCounts = (requests || []).reduce((acc, req) => {
        const status = req.status;
        if (status) {
          acc[status] = (acc[status] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const videoCounts = (videoRequestsData || []).reduce((acc, req) => {
        const status = req.status;
        if (status) {
          acc[status] = (acc[status] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      // Get photo spending
      const { data: photoBalanceData } = await supabase
        .from('balance')
        .select('amount')
        .eq('type', 'token_deduction')
        .ilike('description', '%photo%');

      // Get video spending
      const { data: videoBalanceData } = await supabase
        .from('balance')
        .select('amount')
        .eq('type', 'token_deduction')
        .ilike('description', '%video%');

      const photoTotalSpent = photoBalanceData?.reduce((sum, record) => sum + Math.abs(record.amount), 0) || 0;
      const videoTotalSpent = videoBalanceData?.reduce((sum, record) => sum + Math.abs(record.amount), 0) || 0;

      setStats({
        photo: {
          found: photoCounts.found || 0,
          not_found: photoCounts.not_found || 0,
          cancel: photoCounts.cancel || 0,
          completed: photoCounts.completed || 0,
          totalSpent: photoTotalSpent
        },
        video: {
          found: videoCounts.found || 0,
          not_found: videoCounts.not_found || 0,
          cancel: videoCounts.cancel || 0,
          completed: videoCounts.completed || 0,
          totalSpent: videoTotalSpent
        }
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

  const loadMoreVideoRequests = async () => {
    if (!hasMoreVideos || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = videoPage + 1;
      const { requests: newData, hasMore: more } = await getVideoRequests(
        nextPage,
        20,
        selectedVideoStatus === 'closed'
      );

      setVideoRequests(prev => [...prev, ...newData]);
      setHasMoreVideos(more);
      setVideoPage(nextPage);
    } catch (error) {
      console.error('Error loading more video requests:', error);
      toast.error('Failed to load more video requests');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleStatusChange = async (requestId: string, status: PhotoRequestStatus) => {
    try {
      await updatePhotoRequestStatus(requestId, status);
      
      const oldStatus = requests.find(r => r.id === requestId)?.status;
      
      // Update stats locally
      if (oldStatus) {
        setStats(prev => ({
          ...prev,
          photo: {
            ...prev.photo,
            [status]: (prev.photo[status] || 0) + 1,
            [oldStatus]: Math.max(0, (prev.photo[oldStatus] || 0) - 1)
          }
        }));
      }
      
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status } : req
      ));
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleVideoStatusChange = async (requestId: string, status: VideoRequestStatus) => {
    try {
      await updateVideoRequestStatus(requestId, status);

      const oldStatus = videoRequests.find(r => r.id === requestId)?.status;
      
      // Update stats locally
      if (oldStatus) {
        setStats(prev => ({
          ...prev,
          video: {
            ...prev.video,
            [status]: (prev.video[status] || 0) + 1,
            [oldStatus]: Math.max(0, (prev.video[oldStatus] || 0) - 1)
          }
        }));
      }
      
      setVideoRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status } : req
      ));
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  useEffect(() => {
    if (open) {
      loadVideoRequests();
    }
  }, [selectedVideoStatus]);

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
      <Stats stats={stats} activeTab={activeTab} />
      <Tabs defaultValue="photos" className="w-full" onValueChange={(value) => setActiveTab(value as 'photos' | 'videos')}>
        <TabsList>
          <TabsTrigger value="photos">Photo Requests</TabsTrigger>
          <TabsTrigger value="videos">Video Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="photos">
          <div className="space-y-4">
            <div className="p-4 bg-card rounded-lg border">
              <StatusFilter 
                selectedStatus={selectedStatus} 
                onStatusChange={setSelectedStatus}
              />
            </div>
            <Card>
              <CardContent className="p-6">
              <div className="pt-4">
                <RequestList
                  requests={sortedRequests}
                  onStatusChange={handleStatusChange}
                  onLoadMore={loadMoreRequests}
                  hasMore={hasMore}
                  loading={loadingMore}
                  type="photo"
                />
              </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="space-y-4">
            <div className="p-4 bg-card rounded-lg border">
              <StatusFilter 
                selectedStatus={selectedVideoStatus} 
                onStatusChange={setSelectedVideoStatus} 
              />
            </div>
            <Card>
              <CardContent className="p-6">
              <div className="pt-4">
                <RequestList
                  requests={sortedVideoRequests}
                  onStatusChange={handleVideoStatusChange}
                  onLoadMore={loadMoreVideoRequests}
                  hasMore={hasMoreVideos}
                  loading={loadingMore}
                  type="video"
                />
              </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}