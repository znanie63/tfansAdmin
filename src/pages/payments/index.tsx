import { useState, useEffect } from 'react';
import { CreditCard, Star, Coins } from 'lucide-react';
import { Payment, TierStats, getPayments, getTierStats } from '@/lib/payments';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tierStats, setTierStats] = useState<TierStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const [data, stats] = await Promise.all([
        getPayments(),
        getTierStats()
      ]);
      setPayments(data);
      setTierStats(stats);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalPayments: payments.reduce((sum, p) => sum + p.total_amount, 0),
    totalTokens: payments.reduce((sum, p) => sum + (p.tier?.tokens || 0), 0),
    completedPayments: payments.length,
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
            <CreditCard className="h-8 w-8 text-primary/80" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Payments</h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            View and manage user payments
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <h3 className="font-medium">Tier Statistics</h3>
            <div className="space-y-2">
              {tierStats.map((stat) => (
                <div 
                  key={stat.tier_id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{stat.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {stat.total_payments} payments
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5 font-medium">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {stat.total_amount}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 text-sm text-primary">
                        <Coins className="h-3.5 w-3.5" />
                        {stat.total_tokens} TFC
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-lg font-bold mt-0.5">{stats.totalPayments} Stars</p>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Star className="h-3.5 w-3.5 mr-1.5" />
                Stars
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Tokens</p>
                <p className="text-lg font-bold mt-0.5">{stats.totalTokens} TFC</p>
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                <Coins className="h-3.5 w-3.5 mr-1.5" />
                Tokens
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Completed Payments</p>
                <p className="text-lg font-bold mt-0.5">{stats.completedPayments}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                Payments
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={payment.user?.photo_url} />
                    </Avatar>
                    <span className="font-medium">
                      {payment.user?.username || 'Unknown User'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {payment.total_amount}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-primary" />
                    {payment.tier?.tokens || 0} TFC
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {payment.tier?.description || 'Unknown Package'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(payment.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}