import { PhotoRequest, PhotoRequestStatus, VideoRequest, VideoRequestStatus } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface RequestCardProps {
  request: PhotoRequest | VideoRequest;
  onStatusChange: (requestId: string, status: PhotoRequestStatus | VideoRequestStatus) => void;
  type: 'photo' | 'video';
}

export default function RequestCard({ request, onStatusChange, type }: RequestCardProps) {
  const getStatusBadge = (status: PhotoRequestStatus) => {
    switch (status) {
      case 'found':
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Found</Badge>;
      case 'not_found':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">Not Found</Badge>;
      case 'cancel':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-500">Cancelled</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-500">Completed</Badge>;
    }
  };

  return (
    <Card 
      className={cn(
        "group transition-all duration-200 hover:shadow-md",
        (request.status === 'completed' || request.status === 'found')
          ? "opacity-60 hover:opacity-80" 
          : "hover:shadow-md"
      )}
    >
      <CardHeader className="pb-2 space-y-0">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {request.status === 'not_found' ? (
                <Select
                  value={request.status}
                  onValueChange={(value) => onStatusChange(request.id, value as PhotoRequestStatus)}
                >
                  <SelectTrigger className="w-[110px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="found">Found</SelectItem>
                    <SelectItem value="not_found">Not Found</SelectItem>
                    <SelectItem value="cancel">Cancel</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                getStatusBadge(request.status)
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {Math.round(request.chance ?? 0)}% chance
              </Badge>
            </div>
          </div>
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
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-2">
          {request.message}
        </p>
        
        {['completed', 'not_found'].includes(request.status) && (
          <div className="text-xs text-muted-foreground italic">
            {request.status === 'completed' ? 'Request completed' : `No suitable ${type === 'photo' ? 'photos' : 'videos'} found`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { RequestCard }