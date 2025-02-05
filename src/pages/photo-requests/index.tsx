import { useState, useEffect, useMemo } from 'react';
import { Image, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getPhotoRequests, updatePhotoRequestStatus } from '@/lib/photo-requests';
import { sendMessage } from '@/lib/chats';
import { getModelPhotos } from '@/lib/models';
import { PhotoRequest, PhotoRequestStatus, ModelPhoto } from '@/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PhotoGallery } from '@/components/photos/photo-gallery';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface RequestStats {
  new: number;
  cancel: number;
  closed: number;
  totalSpent: number;
}

export function PhotoRequests() {
  const [requests, setRequests] = useState<PhotoRequest[]>([]);
  const [stats, setStats] = useState<RequestStats>({
    new: 0,
    cancel: 0,
    closed: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PhotoRequest | null>(null);
  const [showPhotosDialog, setShowPhotosDialog] = useState(false);
  const [modelPhotos, setModelPhotos] = useState<ModelPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  // Sort requests by status and date
  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      // First sort by status priority
      const statusPriority = { new: 0, cancel: 1, closed: 2 };
      const statusDiff = statusPriority[a.status] - statusPriority[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // Then sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [requests]);

  useEffect(() => {
    loadRequests();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get request counts by status
      const { data: requests } = await supabase
        .from('photo_requests')
        .select('status');

      const counts = (requests || []).reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get total tokens spent
      const { data: balanceData } = await supabase
        .from('balance')
        .select('amount')
        .eq('type', 'token_deduction')
        .like('description', '%фото%');

      const totalSpent = balanceData?.reduce((sum, record) => sum + Math.abs(record.amount), 0) || 0;

      setStats({
        new: counts.new || 0,
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
      const data = await getPhotoRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading photo requests:', error);
      toast.error('Failed to load photo requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, status: PhotoRequestStatus) => {
    try {
      await updatePhotoRequestStatus(requestId, status);
      await loadStats(); // Reload stats after status change
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status } : req
      ));
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleViewPhotos = async (modelId: string) => {
    try {
      setLoadingPhotos(true);
      setSelectedModelId(modelId);
      const photos = await getModelPhotos(modelId);
      setModelPhotos(photos);
      setShowPhotosDialog(true);
    } catch (error) {
      console.error('Error loading model photos:', error);
      toast.error('Failed to load model photos');
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleSendPhoto = async (photo: ModelPhoto) => {
    if (!selectedRequest?.chat || !selectedRequest.userId) return;

    setShowPhotosDialog(false);

    const { data: model } = await supabase
      .from('models')
      .select('price_photo')
      .eq('id', selectedRequest.chat.model.id)
      .single();

    if (!model) {
      toast.error('Failed to get photo price');
      return;
    }

    try {
      // Create balance record for token deduction
      const { error: balanceError } = await supabase
        .from('balance')
        .insert({
          user_id: selectedRequest.userId,
          amount: -model.price_photo,
          type: 'token_deduction',
          description: 'Списание за отправку фото'
        });

      if (balanceError) {
        console.error('Balance deduction error:', balanceError);
        toast.error('Failed to process token deduction');
        return;
      }

      // Send message with photo
      await sendMessage(selectedRequest.chat.id, {
        content: 'Here is your requested photo',
        messageType: 'image',
        imageUrl: photo.image,
        userId: selectedRequest.userId,
        isFromUser: false,
        isAdmin: true
      });

      // Update request status to closed
      await updatePhotoRequestStatus(selectedRequest.id, 'closed');
      
      // Reload data
      await loadStats();
      await loadRequests();
      
      setShowPhotosDialog(false);
      setSelectedModelId(null);
      toast.success('Photo sent successfully');
    } catch (error) {
      console.error('Error sending photo:', error);
      toast.error('Failed to process request');
    }
  };

  const getStatusBadge = (status: PhotoRequestStatus) => {
    switch (status) {
      case 'new':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">New</Badge>;
      case 'cancel':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-500">Cancelled</Badge>;
      case 'closed':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-500">Completed</Badge>;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Image className="h-8 w-8 text-primary/80" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Photo Requests</h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage and respond to user photo requests
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">New</p>
                <p className="text-lg font-bold mt-0.5">{stats.new}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">New</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Cancelled</p>
                <p className="text-lg font-bold mt-0.5">{stats.cancel}</p>
              </div>
              <Badge variant="secondary" className="bg-red-500/10 text-red-500">Cancelled</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Completed</p>
                <p className="text-lg font-bold mt-0.5">{stats.closed}</p>
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">Completed</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Spent</p>
                <p className="text-lg font-bold mt-0.5">{stats.totalSpent} TFC</p>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">Tokens</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="h-px bg-border" />

      {requests.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedRequests.map((request) => (
            <Card 
              key={request.id}
              className={cn(
                "group transition-all duration-200 hover:shadow-md",
                request.status === 'closed' 
                  ? "opacity-60 hover:opacity-80" 
                  : "hover:shadow-md"
              )}
            >
              <CardHeader className="pb-2 space-y-0">
                <div className="flex items-center justify-between">
                  {getStatusBadge(request.status)}
                  {request.status !== 'closed' && <Select
                    value={request.status}
                    onValueChange={(value) => handleStatusChange(request.id, value as PhotoRequestStatus)}
                  >
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="cancel">Cancel</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>}
                </div>
              </CardHeader>
              <CardContent className="pt-2 space-y-3">
                {request.chat && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={request.chat.user.avatar} />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {request.chat.user.username}
                      </p>
                      <p className="text-xs text-primary mt-0.5">
                        {request.chat.model.firstName} {request.chat.model.lastName}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {request.message}
                </p>

                {request.chat && request.status !== 'closed' ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      className="w-full h-8 text-sm hover:bg-primary/5"
                      onClick={() => {
                        setSelectedRequest(request);
                        handleViewPhotos(request.chat.model.id);
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                ) : request.status === 'closed' && (
                  <div className="text-xs text-muted-foreground italic">
                    Request completed
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Image className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No photo requests</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Photo requests from users will appear here.
          </p>
        </div>
      )}

      <Dialog 
        open={showPhotosDialog} 
        onOpenChange={(open) => {
          // When closing photos dialog, don't affect chat dialog
          setShowPhotosDialog(open);
          if (!open) {
            setSelectedModelId(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Photo to Send</DialogTitle>
            <DialogDescription>
              Choose a photo from the model's gallery to send as a response.
              The user will be charged {selectedRequest?.chat?.model.price_photo} TFC for this photo.
            </DialogDescription>
          </DialogHeader>

          <PhotoGallery
            photos={modelPhotos}
            loading={loadingPhotos}
            onSelectPhoto={handleSendPhoto}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}