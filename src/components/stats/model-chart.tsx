import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge'; 
import { MessageSquare, Image, Coins } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DashboardStats {
  totalChats: number;
  totalMessages: number;
  totalPhotos: number;
  totalSpent: number;
  averageMessages: number;
  averagePhotos: number;
}

interface ModelStats {
  date: string;
  chats: number;
  photos: number;
  messages: number;
}

interface ModelChartProps {
  modelId?: string;
}

export function ModelChart({ modelId }: ModelChartProps) {
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(modelId || null);
  const [modelStats, setModelStats] = useState<DashboardStats | null>(null);
  const [data, setData] = useState<ModelStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [averages, setAverages] = useState<{ messagesPerChat: number; photosPerChat: number }>({
    messagesPerChat: 0,
    photosPerChat: 0
  });

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      loadStats(selectedModel);
    }
  }, [selectedModel]);

  const loadModels = async () => {
    try {
      const { data: models, error } = await supabase
        .from('models')
        .select('id, first_name, last_name')
        .order('first_name');

      if (error) throw error;

      setModels(models.map(m => ({
        id: m.id,
        name: `${m.first_name} ${m.last_name}`
      })));
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error('Failed to load models');
    }
  };

  const loadStats = async (modelId: string) => {
    try {
      setLoading(true);
      // Get model stats
      const { data: modelStats, error: statsError } = await supabase
        .rpc('get_model_chat_stats', { model_id_param: modelId });

      if (statsError) throw statsError;

      // Set model stats
      setModelStats({
        totalChats: modelStats.total_chats,
        totalMessages: modelStats.total_messages,
        totalPhotos: modelStats.total_photos,
        totalSpent: modelStats.total_spent,
        averageMessages: modelStats.average_messages,
        averagePhotos: modelStats.average_photos
      });

      // Get daily stats
      const { data: dailyStats, error: dailyError } = await supabase
        .rpc('get_model_daily_stats', { model_id_param: modelId });
      
      if (dailyError) throw dailyError;
      
      // Update averages
      setAverages({
        messagesPerChat: modelStats.average_messages,
        photosPerChat: modelStats.average_photos
      });
      
      // Transform daily stats for chart
      setData(dailyStats.map(day => ({
        date: format(new Date(day.date), 'yyyy-MM-dd'),
        chats: day.chats,
        messages: day.messages,
        photos: day.photos
      })));
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (!models.length) {
    return (
      <Card>
        <CardContent className="py-16">
          <p className="text-center text-muted-foreground">No models available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-4 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <CardTitle className="text-base font-normal">
                Model Activity
              </CardTitle>
            </div>
            <Select
              value={selectedModel || undefined}
              onValueChange={setSelectedModel}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {models.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {modelStats && selectedModel && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary whitespace-nowrap">
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                  {modelStats.totalChats} chats
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 whitespace-nowrap">
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                  {modelStats.averageMessages} msgs/chat
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-500/10 text-green-500 whitespace-nowrap">
                  <Image className="h-3.5 w-3.5 mr-1.5" />
                  {modelStats.averagePhotos} photos/chat
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 whitespace-nowrap">
                  <Coins className="h-3.5 w-3.5 mr-1.5" />
                  {modelStats.totalSpent} TFC
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!selectedModel ? (
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground">Select a model to view statistics</p>
          </div>
        ) : loading ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="h-[350px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload) return null;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="text-xs text-muted-foreground mb-2">
                          {new Date(label).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="grid gap-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ background: 'hsl(0, 0%, 0%)' }} />
                            <span className="text-xs font-medium">
                              Chats: {payload[2]?.value}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ background: 'hsl(210, 100%, 50%)' }} />
                            <span className="text-xs font-medium">
                              Messages: {payload[1]?.value}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ background: 'hsl(142, 76%, 36%)' }} />
                            <span className="text-xs font-medium">
                              Photos: {payload[0]?.value}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="photos"
                  stroke="hsl(142, 76%, 36%)"
                  fill="url(#gradient-photos)"
                  strokeWidth={2}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="hsl(210, 100%, 50%)"
                  fill="url(#gradient-messages)"
                  strokeWidth={2}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="chats"
                  stroke="hsl(0, 0%, 0%)"
                  fill="url(#gradient-chats)"
                  strokeWidth={2}
                  dot={false}
                />
                <defs>
                  <linearGradient id="gradient-chats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0, 0%, 0%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(0, 0%, 0%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradient-messages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradient-photos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}