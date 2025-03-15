import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface SocialLinksProps {
  form: UseFormReturn<any>;
}

export function SocialLinks({ form }: SocialLinksProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="chatLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Chat Link</FormLabel>
            <FormControl>
              <Input 
                {...field}
                placeholder="https://t.me/username"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="instagramLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instagram Link (optional)</FormLabel>
            <FormControl>
              <Input 
                {...field}
                placeholder="https://instagram.com/username"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="otherSocialLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Other Social Link (optional)</FormLabel>
            <FormControl>
              <Input 
                {...field}
                placeholder="https://example.com/profile"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}