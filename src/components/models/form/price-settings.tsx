import { useState } from 'react';
import { Coins } from 'lucide-react';
import { Model } from '@/types';
import { toast } from 'sonner';
import { updateModel } from '@/lib/models';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface PriceSettingsProps {
  modelId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPriceChange?: () => void;
  initialPrices?: {
    price: number;
    price_photo: number;
    price_voice: number;
    price_video: number;
  };
}

export function PriceSettings({ 
  modelId, 
  open, 
  onOpenChange, 
  onPriceChange,
  initialPrices 
}: PriceSettingsProps) {
  const [saving, setSaving] = useState(false);
  const [prices, setPrices] = useState({
    price: initialPrices?.price || 50,
    price_photo: initialPrices?.price_photo || 50,
    price_voice: initialPrices?.price_voice || 50,
    price_video: initialPrices?.price_video || 50,
  });

  const handleSave = async () => {
    if (!modelId) return;

    try {
      setSaving(true);
      await updateModel(modelId, prices);
      toast.success('Price settings saved successfully');
      onPriceChange?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving price settings:', error);
      toast.error('Failed to save price settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Price Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Message Price (TFC)</Label>
            <Input
              type="number"
              min={0}
              value={prices.price}
              onChange={(e) => setPrices(prev => ({ ...prev, price: Number(e.target.value) }))}
            />
            <p className="text-sm text-muted-foreground">
              Cost per 1000 tokens
            </p>
          </div>

          <div className="space-y-2">
            <Label>Photo Price (TFC)</Label>
            <Input
              type="number"
              min={0}
              value={prices.price_photo}
              onChange={(e) => setPrices(prev => ({ ...prev, price_photo: Number(e.target.value) }))}
            />
            <p className="text-sm text-muted-foreground">
              Cost per photo request
            </p>
          </div>

          <div className="space-y-2">
            <Label>Voice Price (TFC)</Label>
            <Input
              type="number"
              min={0}
              value={prices.price_voice}
              onChange={(e) => setPrices(prev => ({ ...prev, price_voice: Number(e.target.value) }))}
            />
            <p className="text-sm text-muted-foreground">
              Cost per voice message
            </p>
          </div>

          <div className="space-y-2">
            <Label>Video Price (TFC)</Label>
            <Input
              type="number"
              min={0}
              value={prices.price_video}
              onChange={(e) => setPrices(prev => ({ ...prev, price_video: Number(e.target.value) }))}
            />
            <p className="text-sm text-muted-foreground">
              Cost per video message
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                Saving...
              </>
            ) : (
              'Save Price Settings'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}