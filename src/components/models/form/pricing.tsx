import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Volume2, Video } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

interface PricingProps {
  form: UseFormReturn<any>;
}

export function Pricing({ form }: PricingProps) {
  return (
    <div className="space-y-6 border-t pt-6">
      <h3 className="text-lg font-semibold">Pricing Settings</h3>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Message Price */}
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

        {/* Photo Price */}
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

        {/* Voice Price */}
        <FormField
          control={form.control}
          name="price_voice"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                Voice Price (TFC)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Cost per voice message
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Video Price */}
        <FormField
          control={form.control}
          name="price_video"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                Video Price (TFC)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Cost per video message
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}