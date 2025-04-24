import { Volume2, Video } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { PriceInput } from './price-input';

interface PricingProps {
  form: UseFormReturn<any>;
}

export function Pricing({ form }: PricingProps) {
  return (
    <div className="space-y-6 border-t pt-6">
      <h3 className="text-lg font-semibold">Pricing Settings</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <PriceInput
          form={form}
          name="price"
          label="Message Price (TFC)"
          description="Cost per 1000 tokens"
        />

        <PriceInput
          form={form}
          name="price_photo"
          label="Photo Price (TFC)"
          description="Cost per photo request"
        />

        <PriceInput
          form={form}
          name="price_voice"
          label="Voice Price (TFC)"
          description="Cost per voice message"
          icon={<Volume2 className="h-4 w-4" />}
        />

        <PriceInput
          form={form}
          name="price_video"
          label="Video Price (TFC)"
          description="Cost per video message"
          icon={<Video className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}