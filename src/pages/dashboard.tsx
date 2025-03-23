import { useState, useEffect, useMemo } from 'react';
import { getDashboardStats, DashboardStats, getUserStats, getRegistrationStats } from '@/lib/stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserCircle,
  Target,
  Star,
  Users as UsersIcon,
  Coins,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModelChart } from '@/components/stats/model-chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    totalSpent: 0
  });
  const [registrationStats, setRegistrationStats] = useState<{ date: string; count: number; }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([loadStats(), loadUserStats(), loadRegistrationStats()]);
  }, []);

  const loadRegistrationStats = async () => {
    try {
      const data = await getRegistrationStats();
      setRegistrationStats(data);
    } catch (error) {
      console.error('Error loading registration stats:', error);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const data = await getUserStats();
      setUserStats(data);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const statCards = useMemo(() => [
    {
      title: 'Total Models',
      value: stats?.totalModels.current.toString() || '0',
      icon: UserCircle,
      change: stats?.totalModels.change !== 0 ? (
        stats?.totalModels.change > 0 ? `+${stats.totalModels.change}` : stats?.totalModels.change
      ) : undefined,
      trend: stats?.totalModels.trend || 'neutral',
      description: 'Active model profiles',
    },
    {
      title: 'Active Tasks',
      value: stats?.activeTasks.current.toString() || '0',
      icon: Target,
      change: stats?.activeTasks.change !== 0 ? (
        stats?.activeTasks.change > 0 ? `+${stats.activeTasks.change}` : stats?.activeTasks.change
      ) : undefined,
      trend: stats?.activeTasks.trend || 'neutral',
      description: 'Available for users',
    },
    {
      title: 'Total Reviews',
      value: stats?.totalReviews.current.toString() || '0',
      icon: Star,
      change: stats?.totalReviews.change !== 0 ? (
        stats?.totalReviews.change > 0 ? `+${stats.totalReviews.change}` : stats?.totalReviews.change
      ) : undefined,
      trend: stats?.totalReviews.trend || 'neutral',
      description: 'User feedback received',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers.current.toString() || '0',
      icon: UsersIcon,
      change: stats?.totalUsers.change !== 0 ? (
        stats?.totalUsers.change > 0 ? `+${stats.totalUsers.change}` : stats?.totalUsers.change
      ) : undefined,
      trend: stats?.totalUsers.trend || 'neutral',
      description: 'Registered users',
    },
  ], [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={loadStats} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Users</p>
                <p className="text-lg font-bold mt-0.5">{userStats.totalUsers}</p>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <UsersIcon className="h-3.5 w-3.5 mr-1.5" />
                Users
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Balance</p>
                <p className="text-lg font-bold mt-0.5">{userStats.totalBalance} TFC</p>
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                <Coins className="h-3.5 w-3.5 mr-1.5" />
                Balance
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Spent</p>
                <p className="text-lg font-bold mt-0.5">{userStats.totalSpent} TFC</p>
              </div>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                <TrendingDown className="h-3.5 w-3.5 mr-1.5" />
                Spent
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="h-px bg-border my-8" />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            User Registrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationStats}>
                <defs>
                  <linearGradient id="registrationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <span className="text-xs font-medium">
                              {payload[0]?.value} registrations
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  fill="url(#registrationGradient)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <ModelChart />
      
      <div className="h-px bg-border my-8" />

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {stat.change && (
                  <Badge
                    variant={stat.trend === 'neutral' ? 'secondary' : 'default'}
                    className={cn(
                      "font-normal",
                      stat.trend === 'up' ? "text-green-600 bg-green-100" : 
                      stat.trend === 'down' ? "text-red-600 bg-red-100" :
                      "text-muted-foreground bg-muted"
                    )}
                  >
                    {stat.change}
                  </Badge>
                )}
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}