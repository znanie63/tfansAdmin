import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ImageIcon, Coins, TrendingUp, BarChart2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ModelStats {
  totalChats: number;
  totalPhotos: number;
  totalSpent: number;
  averageMessages: number;
  averagePhotos: number;
}

interface ModelStatsProps {
  modelId: string;
}

export function ModelStats({ modelId }: ModelStatsProps) {
  const [stats, setStats] = useState<ModelStats>({
    totalChats: 0,
    totalPhotos: 0,
    totalSpent: 0,
    averageMessages: 0,
    averagePhotos: 0
  });
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_model_chat_stats', { model_id_param: modelId });
      
      if (error) throw error;

      setStats({
        totalChats: data.total_chats,
        totalPhotos: data.total_photos,
        totalSpent: data.total_spent,
        averageMessages: data.average_messages,
        averagePhotos: data.average_photos
      });
      setLoaded(true);
    } catch (error) {
      console.error('Error loading model stats:', error);
      toast.error('Failed to load model stats');
    } finally {
      setLoading(false);
    }
  };

  if (!loaded && !loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[120px]">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={loadStats}
              disabled={loading}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Load Statistics
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && !loaded) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-[68px] animate-pulse bg-muted rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Chats</p>
              <p className="text-lg font-bold mt-0.5">{stats.totalChats}</p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Chats
            </Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Average Messages</p>
              <p className="text-lg font-bold mt-0.5">{stats.averageMessages} / chat</p>
            </div>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Messages
            </Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Average Photos</p>
              <p className="text-lg font-bold mt-0.5">{stats.averagePhotos} / chat</p>
            </div>
            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Photos
            </Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Photos Sent</p>
              <p className="text-lg font-bold mt-0.5">{stats.totalPhotos}</p>
            </div>
            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
              <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
              Photos
            </Badge>
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
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
              <Coins className="h-3.5 w-3.5 mr-1.5" />
              Tokens
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}