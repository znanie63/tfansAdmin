import { useState, useEffect, useMemo } from 'react';
import { getDashboardStats, DashboardStats } from '@/lib/stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserCircle,
  Target,
  Star,
  Users as UsersIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const [timeframe] = useState<'today' | 'week'>('today');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

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
        <div className="flex items-center gap-2">
          <Button variant={timeframe === 'today' ? 'default' : 'outline'} size="sm">
            Today
          </Button>
          <Button variant={timeframe === 'week' ? 'default' : 'outline'} size="sm">
            This Week
          </Button>
        </div>
      </div>

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