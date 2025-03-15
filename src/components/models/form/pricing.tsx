import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface PricingProps {
  form: UseFormReturn<any>;
}

export function Pricing({ form }: PricingProps) {
  return (
    <div className="space-y-6 border-t pt-6">
      <h3 className="text-lg font-semibold">Pricing Settings</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message Price (TFC)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Cost per 1000 tokens
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price_photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo Price (TFC)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Cost per photo request
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}