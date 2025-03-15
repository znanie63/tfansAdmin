import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

interface PersonalityProps {
  form: UseFormReturn<any>;
}

export function Personality({ form }: PersonalityProps) {
  return (
    <div className="space-y-6 border-t pt-6">
      <h3 className="text-lg font-semibold">Personality Settings</h3>
      
      <FormField
        control={form.control}
        name="prompt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Personality Prompt</FormLabel>
            <FormControl>
              <Textarea 
                {...field}
                className="min-h-[150px] resize-none"
                placeholder="Write a detailed prompt describing the model's personality, communication style, and how they should interact with users..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}