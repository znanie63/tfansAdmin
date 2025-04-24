import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface PriceInputProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function PriceInput({ 
  form, 
  name, 
  label, 
  description, 
  icon,
  className 
}: PriceInputProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="flex items-center gap-2">
            {icon}
            {label}
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              min={0}
              {...field}
              onChange={e => field.onChange(Number(e.target.value))}
              className="font-mono"
            />
          </FormControl>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}