import { useState, useRef } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import * as z from 'zod';
import { Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormMessage,
} from '@/components/ui/form';
import { getCategories, Category } from '@/lib/categories';
import { BasicInfo } from './form/basic-info';
import { Status } from './form/status';
import { Personality } from './form/personality';
import { CategoriesSection } from './form/categories-section';
import { Characteristics } from './form/characteristics';
import { SocialLinks } from './form/social-links';
import { Pricing } from './form/pricing';
import { Model } from '@/types';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  nickname: z.string().min(2, 'Nickname must be at least 2 characters'),
  quote: z.string().min(10, 'Quote must be at least 10 characters'),
  height: z.number().min(140).max(220),
  weight: z.number().min(40).max(150),
  prompt: z.string()
    .min(10, 'Prompt must be at least 10 characters'),
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
  isActive: z.boolean(),
  categories: z.array(z.string()).optional(),
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCategories();
    // Initialize selected categories from initialData
    if (initialData?.categories) {
      setSelectedCategories(initialData.categories.map(c => c.id));
    }
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    }
  };

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
      isActive: initialData?.isActive ?? true,
      categories: initialData?.categories?.map(c => c.id) || [],
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
        categories: selectedCategories,
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

          <BasicInfo form={form} />
          <Status form={form} />
          <Personality form={form} />
          <CategoriesSection
            form={form}
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />
          <Characteristics
            characteristics={characteristics}
            setCharacteristics={setCharacteristics}
          />
          <SocialLinks form={form} />
          <Pricing form={form} />
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