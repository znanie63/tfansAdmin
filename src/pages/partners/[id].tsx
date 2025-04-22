import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Users, UserCheck, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Partner } from '@/types';

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d');
};

export function PartnerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const telegramBotUrl = import.meta.env.VITE_TELEGRAM_BOT_URL;

  useEffect(() => {
    loadPartner();
  }, [id]);

  const loadPartner = async () => {
    try {
      setLoading(true);

      // Get partner data
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select(`
          user_id,
          email,
          notes,
          created_at,
          users (
            refferal_code,
            first_name
          )
        `)
        .eq('user_id', id)
        .single();

      if (partnerError) throw partnerError;

      // Get referral count
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('refferer_id', partnerData.user_id);

      // Get daily stats
      const { data: dailyStats, error: statsError } = await supabase
        .from('users')
        .select('created_at, is_open_webapp')
        .eq('refferer_id', partnerData.user_id)
        .order('created_at', { ascending: true });

      if (statsError) throw statsError;

      // Process daily stats
      const dailyData = dailyStats.reduce((acc: any, curr: any) => {
        const date = curr.created_at.split('T')[0];
        if (!acc[date]) {
          acc[date] = { total: 0, active: 0 };
        }
        acc[date].total++;
        if (curr.is_open_webapp) {
          acc[date].active++;
        }
        return acc;
      }, {});

      const chartData = Object.entries(dailyData).map(([date, stats]: [string, any]) => ({
        date,
        total_users: stats.total,
        active_users: stats.active,
        conversion_rate: stats.active / stats.total
      }));

      setStatistics(chartData);
      setPartner({
        id: partnerData.user_id,
        email: partnerData.email,
        firstName: partnerData.users.first_name,
        referralCode: partnerData.users.refferal_code,
        notes: partnerData.notes,
        referralCount: count || 0,
        createdAt: new Date(partnerData.created_at)
      });
    } catch (error) {
      console.error('Error loading partner:', error);
      toast.error('Failed to load partner data');
      navigate('/partners');
    } finally {
      setLoading(false);
    }
  };

  const referralLink = partner ? `${telegramBotUrl}?start=${partner.referralCode}` : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Partner not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/partners')}
            className="h-9 px-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="ml-2 text-sm hidden sm:inline">Back</span>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{partner.firstName}</h2>
            <p className="text-muted-foreground">
              Partner Dashboard
            </p>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Referral Link</CardTitle>
          <CardDescription>Share this link with users</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <div className="flex-1">
            <Input
              readOnly
              value={referralLink}
              className="font-mono bg-muted"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            className="shrink-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partner.referralCount}
            </div>
            <div className="text-xs text-muted-foreground">
              Total referrals in the system
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.reduce((sum, stat) => sum + stat.active_users, 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              Referrals who opened the app
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>User acquisition over time</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={statistics}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                formatter={(value) => [value, ""]}
                labelFormatter={(label) => formatDate(label as string)}
              />
              <Area 
                type="monotone" 
                dataKey="total_users" 
                name="Total Users"
                stroke="hsl(var(--chart-1))" 
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
              <Area 
                type="monotone" 
                dataKey="active_users" 
                name="Active Users"
                stroke="hsl(var(--chart-2))" 
                fillOpacity={1} 
                fill="url(#colorActive)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {partner.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Partnership Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm whitespace-pre-wrap">{partner.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}