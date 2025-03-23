import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tier } from '@/lib/tiers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const formSchema = z.object({
  tokens: z.number().min(1, 'Must be at least 1 token'),
  price: z.number().min(1, 'Price must be at least 1 star'),
  description: z.string().max(20, 'Description must be 20 characters or less'),
  badge: z.string().optional(),
  invoice_link: z.string().optional(),
});

interface TierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'view';
  tier?: Tier | null;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isSubmitting?: boolean;
}

export function TierDialog({ open, onOpenChange, mode, tier, onSubmit, isSubmitting }: TierDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokens: tier?.tokens || 0,
      price: tier?.price || 0,
      description: tier?.description || '',
      badge: tier?.badge || '',
      invoice_link: tier?.invoice_link || '',
    },
  });

  useEffect(() => {
    if (tier) {
      form.reset({
        tokens: tier.tokens,
        price: tier.price,
        description: tier.description,
        badge: tier.badge || '',
        invoice_link: tier.invoice_link || '',
      });
    }
  }, [tier, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Pricing Tier' : 'View Pricing Tier'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pr-2">
            <FormField
              control={form.control}
              name="tokens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Tokens</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      readOnly={mode === 'view'}
                      disabled={mode === 'view'}
                      className={mode === 'view' ? 'bg-muted' : ''}
                      value={field.value || ''}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Amount of TFC tokens users will receive
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (Stars)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      readOnly={mode === 'view'}
                      disabled={mode === 'view'}
                      className={mode === 'view' ? 'bg-muted' : ''}
                      value={field.value || ''}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Cost in Telegram Stars
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={20}
                      readOnly={mode === 'view'}
                      disabled={mode === 'view'}
                      className={mode === 'view' ? 'bg-muted' : ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Short description (max 20 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="badge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Badge (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. popular, best value"
                      readOnly={mode === 'view'}
                      disabled={mode === 'view'}
                      className={mode === 'view' ? 'bg-muted' : ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Special badge to highlight this tier
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Invoice Link (Optional)</Label>
              <Input
                type="url"
                value={form.getValues().invoice_link || ''}
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                Link to the payment invoice
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)} 
                disabled={isSubmitting}
              >
                {mode === 'create' ? 'Cancel' : 'Close'}
              </Button>
              {mode === 'create' && (
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                      Creating...
                    </>
                  ) : (
                    'Add Tier'
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}