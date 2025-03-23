import { useState, useEffect } from 'react';
import { Plus, Star, Coins, Power, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { getTiers, createTier, updateTierStatus, updateTierInvoiceLink } from '@/lib/tiers';
import type { Tier } from '@/lib/tiers';
import { TierDialog } from './pricing/tier-dialog';

export function PricingSettings() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingLinks, setGeneratingLinks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadTiers();
  }, []);

  const loadTiers = async () => {
    try {
      setLoading(true);
      const data = await getTiers();
      setTiers(data);
    } catch (error) {
      console.error('Error loading tiers:', error);
      toast.error('Failed to load pricing tiers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      const newTier = await createTier(values);
      setTiers(prev => [...prev, newTier]);
      toast.success('Tier created successfully');
      setShowAddDialog(false);
    } catch (error) {
      toast.error('Failed to create tier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (tier: Tier) => {
    try {
      await updateTierStatus(tier.id, !tier.is_active);
      setTiers(prev => prev.map(t => 
        t.id === tier.id ? { ...t, is_active: !t.is_active } : t
      ));
      toast.success(`Tier ${tier.is_active ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error('Failed to update tier status');
    }
  };

  const handleGenerateInvoiceLink = async (tier: Tier) => {
    try {
      setGeneratingLinks(prev => ({ ...prev, [tier.id]: true }));
      const updatedTier = await updateTierInvoiceLink(tier.id);
      setTiers(prev => prev.map(t => 
        t.id === updatedTier.id ? updatedTier : t
      ));
      toast.success('Invoice link generated successfully');
    } catch (error) {
      console.error('Error generating invoice link:', error);
      toast.error('Failed to generate invoice link');
    } finally {
      setGeneratingLinks(prev => ({ ...prev, [tier.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Pricing Tiers</h2>
          <p className="text-sm text-muted-foreground">
            Manage token packages and their prices
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tier
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers.map((tier) => (
              <TableRow 
                key={tier.id}
                className={cn(
                  !tier.is_active && "bg-muted/50"
                )}
              >
                <TableCell className="font-medium">
                  <button
                    onClick={() => setSelectedTier(tier)}
                    className="hover:text-primary transition-colors"
                  >
                    {tier.description}
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-primary" />
                    {tier.tokens} TFC
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {tier.price}
                  </div>
                </TableCell>
                <TableCell>
                  {tier.badge && (
                    <Badge variant="secondary" className="capitalize">
                      {tier.badge}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-between gap-2">
                    <Switch
                      checked={tier.is_active}
                      onCheckedChange={() => handleToggleActive(tier)}
                      className="data-[state=checked]:bg-green-500"
                    /> 
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TierDialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open); 
        }}
        mode="create"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
      
      <TierDialog
        open={!!selectedTier}
        onOpenChange={(open) => {
          if (!open) setSelectedTier(null);
        }}
        mode="view"
        tier={selectedTier}
        onSubmit={() => {}}
      />
    </div>
  );
}