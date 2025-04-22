import { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PartnerForm } from './components/partner-form';
import { Partner } from '@/types';
import { useNavigate } from 'react-router-dom';

export function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);

      // First get partners data
      const { data: partnersData, error: partnersError } = await supabase
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
        `);

      if (partnersError) throw partnersError;

      // Then get referral counts for each partner
      const referralCounts = await Promise.all(
        partnersData.map(async (partner) => {
          const { count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('refferer_id', partner.user_id);
          
          return { userId: partner.user_id, count: count || 0 };
        })
      );

      setPartners(partnersData.map(partner => ({
        id: partner.user_id,
        email: partner.email,
        firstName: partner.users.first_name,
        referralCode: partner.users.refferal_code,
        notes: partner.notes,
        referralCount: referralCounts.find(rc => rc.userId === partner.user_id)?.count || 0,
        createdAt: new Date(partner.created_at)
      })));
    } catch (error) {
      console.error('Error loading partners:', error);
      toast.error('Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartner = async (data: Omit<Partner, 'id' | 'created_at'>) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(import.meta.env.VITE_PARTNER_REGISTRATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          first_name: data.firstName,
          refferal_code: data.referralCode,
          notes: data.notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to register partner');
      }

      const newPartner = await response.json();
      await loadPartners(); // Reload partners list

      toast.success('Partner added successfully');
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating partner:', error);
      toast.error('Failed to add partner');
    } finally {
      setIsSubmitting(false);
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
            <Users className="h-8 w-8 text-primary/80" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Partners</h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage referral partners and their codes
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="lg" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Partner
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Referral Code</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Referrals</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No partners found. Add your first partner using the button above.
                </TableCell>
              </TableRow>
            ) : (
              partners.map((partner) => (
                <TableRow 
                  key={partner.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/partners/${partner.id}`)}
                >
                  <TableCell>{partner.email}</TableCell>
                  <TableCell>{partner.firstName}</TableCell>
                  <TableCell>
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                      {partner.referralCode}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="truncate text-sm text-muted-foreground">
                      {partner.notes || '—'}
                    </p>
                  </TableCell>
                  <TableCell>{partner.referralCount}</TableCell>
                  <TableCell>
                    {new Date(partner.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Partner</DialogTitle>
          </DialogHeader>
          <PartnerForm
            onSubmit={handleCreatePartner}
            onCancel={() => setShowCreateDialog(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}