import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import * as z from 'zod';
import { Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Model } from '@/types';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  nickname: z.string().min(2, 'Nickname must be at least 2 characters'),
  quote: z.string().min(10, 'Quote must be at least 10 characters'),
  height: z.number().min(140).max(220),
  weight: z.number().min(40).max(150),
  prompt: z.string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(250, 'Prompt must be at most 250 characters'),
  languages: z.string().min(2, 'Please enter at least one language'),
  characteristics: z.array(z.object({
    key: z.string().min(1, 'Characteristic name is required'),
    value: z.string().min(1, 'Value is required')
  })).optional(),
  chatLink: z.string().url('Please enter a valid URL'),
  instagramLink: z.string().url('Please enter a valid URL').optional(),
  otherSocialLink: z.string().url('Please enter a valid URL').optional(),
  price: z.number().min(1, 'Price must be at least 1 TFC'),
  price_photo: z.number().min(1, 'Photo price must be at least 1 TFC'),
});

interface ModelFormProps {
  initialData?: Model;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

export function ModelForm({ initialData, onSubmit, isSubmitting = false }: ModelFormProps) {
  const [previewImage, setPreviewImage] = useState<string>(
    initialData?.profileImage || ''
  );
  const [characteristics, setCharacteristics] = useState<Array<{ key: string; value: string }>>(
    initialData?.characteristics ? 
      Object.entries(initialData.characteristics).map(([key, value]) => ({ key, value })) : 
      []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      nickname: initialData?.nickname || '',
      quote: initialData?.quote || '',
      height: initialData?.height || 170,
      weight: initialData?.weight || 60,
      prompt: initialData?.prompt || '',
      languages: initialData?.languages?.join(', ') || '',
      characteristics: characteristics,
      chatLink: initialData?.chatLink || '',
      instagramLink: initialData?.instagramLink || '',
      otherSocialLink: initialData?.otherSocialLink || '',
      price: initialData?.price || 50,
      price_photo: initialData?.price_photo || 50,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('File must be an image');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const addCharacteristic = () => {
    setCharacteristics([...characteristics, { key: '', value: '' }]);
  };

  const removeCharacteristic = (index: number) => {
    setCharacteristics(characteristics.filter((_, i) => i !== index));
  };

  const updateCharacteristic = (index: number, field: 'key' | 'value', value: string) => {
    const newCharacteristics = [...characteristics];
    newCharacteristics[index][field] = value;
    setCharacteristics(newCharacteristics);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const imageFile = fileInputRef.current?.files?.[0];
      
      // Only require image for new models
      if (!initialData && !imageFile) {
        toast.error('Please upload a profile image');
        return;
      }
      
      // Prepare form data
      await onSubmit({
        ...values,
        languages: values.languages.split(',').map(lang => lang.trim()),
        characteristics: characteristics.reduce((acc, { key, value }) => {
          if (key && value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
        ...(imageFile && { imageFile }),
        ...(initialData?.profileImage && !imageFile && { profileImage: initialData.profileImage }),
        ...(initialData && { id: initialData.id }),
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save model profile');
    }
  };

  return (
    <Form {...form}>
      <form 
        key={initialData?.id || 'new-form'}
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-8" 
        autoFocus={false}
      >
        <div className="space-y-6 p-6">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="relative w-32 h-32 sm:w-40 sm:h-40 group cursor-pointer" 
              onClick={handleUploadClick}
            >
              {previewImage ? (
                <img
                  key={previewImage}
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-full ring-2 ring-muted transition-all group-hover:ring-primary"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center border-2 border-dashed rounded-full bg-muted/5 transition-all group-hover:border-primary/50 group-hover:bg-muted/10">
                  <Upload className="h-8 w-8 text-muted-foreground transition-all group-hover:text-primary" />
                </div>
              )}
              <Input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Click to upload profile photo (max 5MB)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              key="field-firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              key="field-lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nickname</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="nickname" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quote</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    className="min-h-[100px] resize-none" 
                    placeholder="Write a short bio or memorable quote..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                      maxLength={250}
                      className="min-h-[150px] resize-none"
                      placeholder="Write a detailed prompt describing the model's personality, communication style, and how they should interact with users..."
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    {field.value?.length || 0}/250 characters
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="languages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Languages</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    placeholder="English, Spanish, French (comma-separated)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Custom Characteristics (Optional)</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCharacteristic}
              >
                Add Characteristic
              </Button>
            </div>
            {characteristics.map((char, index) => (
              <div key={index} className="flex gap-4">
                <Input
                  placeholder="Name (e.g. Eye Color)"
                  value={char.key}
                  onChange={(e) => updateCharacteristic(index, 'key', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value (e.g. Blue)"
                  value={char.value}
                  onChange={(e) => updateCharacteristic(index, 'value', e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCharacteristic(index)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

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

        <div className="p-6 border-t">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Model Profile' : 'Create Model Profile'}
          </Button>
        </div>
      </form>
    </Form>
  );
}