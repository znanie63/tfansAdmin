import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ImageIcon, Coins, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [modelId]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Get total chats
      const { count: chatsCount } = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })
        .eq('model_id', modelId)
        .throwOnError();

      // Get total photos sent
      const { data: chats } = await supabase
        .from('chats')
        .select('id')
        .eq('model_id', modelId)
        .throwOnError();

      const chatIds = chats?.map(chat => chat.id) || [];
      
      let photosCount = 0;
      let messagesCount = 0;
      if (chatIds.length > 0) {
        const { data: messages } = await supabase
          .from('messages')
          .select('message_type')
          .eq('is_from_user', false)
          .in('chat_id', chatIds)
          .throwOnError();
        
        photosCount = messages?.filter(m => m.message_type === 'image').length || 0;
        messagesCount = messages?.filter(m => m.message_type === 'text').length || 0;
      }

      // Get total tokens spent
      const { data: transactions, error: txError } = await supabase
        .from('balance')
        .select('amount')
        .eq('type', 'token_deduction')
        .in('chat_id', chatIds);

      if (txError) throw txError;

      const totalSpent = transactions?.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;

      setStats({
        totalChats: chatsCount || 0,
        totalPhotos: photosCount || 0,
        totalSpent: totalSpent,
        averageMessages: chatIds.length ? Number((messagesCount / chatIds.length).toFixed(1)) : 0,
        averagePhotos: chatIds.length ? Number((photosCount / chatIds.length).toFixed(1)) : 0
      });
    } catch (error) {
      console.error('Error loading model stats:', error);
      toast.error('Failed to load model stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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