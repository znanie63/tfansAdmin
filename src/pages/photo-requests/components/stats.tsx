import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';

interface RequestStats {
  found: number;
  not_found: number;
  cancel: number;
  completed: number;
  totalSpent: number;
}

interface StatsProps {
  stats: RequestStats;
}

export function Stats({ stats }: StatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <Card>
        <CardContent className="p-4 relative">
          <div className="flex items-center justify-between">
            <div className="pr-20">
              <p className="text-xs font-medium text-muted-foreground">Found</p>
              <p className="text-lg font-bold mt-0.5">{stats.found || 0}</p>
            </div>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 absolute top-2 right-2">Found</Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 relative">
          <div className="flex items-center justify-between">
            <div className="pr-20">
              <p className="text-xs font-medium text-muted-foreground">Not Found</p>
              <p className="text-lg font-bold mt-0.5">{stats.not_found || 0}</p>
            </div>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 absolute top-2 right-2">Not Found</Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 relative">
          <div className="flex items-center justify-between">
            <div className="pr-20">
              <p className="text-xs font-medium text-muted-foreground">Cancelled</p>
              <p className="text-lg font-bold mt-0.5">{stats.cancel || 0}</p>
            </div>
            <Badge variant="secondary" className="bg-red-500/10 text-red-500 absolute top-2 right-2">Cancelled</Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 relative">
          <div className="flex items-center justify-between">
            <div className="pr-20">
              <p className="text-xs font-medium text-muted-foreground">Completed</p>
              <p className="text-lg font-bold mt-0.5">{stats.completed || 0}</p>
            </div>
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 absolute top-2 right-2">Completed</Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 relative">
          <div className="flex items-center justify-between">
            <div className="pr-20">
              <p className="text-xs font-medium text-muted-foreground">Total Spent</p>
              <p className="text-lg font-bold mt-0.5">{stats.totalSpent || 0} TFC</p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary absolute top-2 right-2">
              <Coins className="h-3.5 w-3.5 mr-1.5" />
              Tokens
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}