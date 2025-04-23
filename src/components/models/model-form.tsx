import { useState, useRef } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { getCategories, Category } from '@/lib/categories';
import { ProfileImage } from './form/profile-image';
import { BasicInfo } from './form/basic-info';
import { Status } from './form/status';
import { Personality } from './form/personality';
import { CategoriesSection } from './form/categories-section';
import { VoiceSettings } from './form/voice-settings';
import { Characteristics } from './form/characteristics';
import { SocialLinks } from './form/social-links';
import { Pricing } from './form/pricing';
import { Model } from '@/types';

interface FormValues {
  firstName: string;
  lastName: string;
  nickname: string;
  quote: string;
  height: number;
  weight: number;
  prompt: string;
  languages: string;
  characteristics?: Array<{ key: string; value: string }>;
  chatLink: string;
  instagramLink?: string;
  otherSocialLink?: string;
  price: number;
  price_photo: number;
  send_voice_chance: number;
  isActive: boolean;
  categories?: string[];
  voice?: {
    id?: string;
    speed: number;
    style: number;
    stability: number;
    similarityBoost: number;
    useSpeakerBoost: boolean;
    elevenlabsVoiceId: string;
  };
}

interface ModelFormProps {
  initialData?: Model;
  onSubmit: (data: FormValues) => Promise<void>;
  isSubmitting?: boolean;
  className?: string;
}

export function ModelForm({ initialData, onSubmit, isSubmitting = false, className }: ModelFormProps) {
  const [previewImage, setPreviewImage] = useState<string>(
    initialData?.profileImage || ''
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [characteristics, setCharacteristics] = useState<Array<{ key: string; value: string }>>(
    initialData?.characteristics ? 
      Object.entries(initialData.characteristics).map(([key, value]) => ({ key, value })) : 
      []
  );
  const [showDebug] = useState(process.env.NODE_ENV === 'development');

  useEffect(() => {
    loadCategories();
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

  const form = useForm<FormValues>({
    mode: 'onChange',
    rules: {
      firstName: {
        required: 'First name is required'
      },
      lastName: {
        required: 'Last name is required'
      },
      nickname: {
        required: 'Nickname is required'
      },
      chatLink: {
        required: 'Chat link is required',
        pattern: {
          value: /^https?:\/\/.+/,
          message: 'Please enter a valid URL starting with http:// or https://'
        }
      },
      instagramLink: {
        pattern: {
          value: /^https?:\/\/.+/,
          message: 'Please enter a valid URL starting with http:// or https://'
        }
      },
      otherSocialLink: {
        pattern: {
          value: /^https?:\/\/.+/,
          message: 'Please enter a valid URL starting with http:// or https://'
        }
      },
      quote: {
        required: 'Quote is required',
        minLength: {
          value: 5,
          message: 'Quote must be at least 5 characters'
        },
        maxLength: {
          value: 150,
          message: 'Quote must not exceed 150 characters'
        }
      },
      prompt: {
        required: 'Personality prompt is required',
        minLength: {
          value: 50,
          message: 'Personality prompt must be at least 50 characters'
        },
        maxLength: {
          value: 100000,
          message: 'Personality prompt must not exceed 100000 characters'
        }
      }
    },
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
      price_voice: initialData?.price_voice || 50,
      price_video: initialData?.price_video || 50,
      send_voice_chance: initialData?.send_voice_chance,
      isActive: initialData?.isActive ?? false,
      categories: initialData?.categories?.map(c => c.id) || [],
      voice: {
        speed: 1,
        style: 0,
        stability: 0,
        similarityBoost: 0,
        useSpeakerBoost: true,
        elevenlabsVoiceId: ''
      }
    },
  });

  const handleImageChange = (file: File) => {
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  const handleSubmit = async (values: FormValues) => {
    try {
      // Validate required fields
      if (!values.firstName?.trim()) {
        form.setError('firstName', { message: 'First name is required' });
        return;
      }

      if (!values.lastName?.trim()) {
        form.setError('lastName', { message: 'Last name is required' });
        return;
      }

      if (!values.nickname?.trim()) {
        form.setError('nickname', { message: 'Nickname is required' });
        return;
      }

      const urlPattern = /^https?:\/\/.+/;
      
      if (!values.chatLink?.trim()) {
        form.setError('chatLink', { message: 'Chat link is required' });
        return;
      }

      if (!urlPattern.test(values.chatLink)) {
        form.setError('chatLink', { message: 'Please enter a valid URL starting with http:// or https://' });
        return;
      }

      if (values.instagramLink?.trim() && !urlPattern.test(values.instagramLink)) {
        form.setError('instagramLink', { message: 'Please enter a valid URL starting with http:// or https://' });
        return;
      }

      if (values.otherSocialLink?.trim() && !urlPattern.test(values.otherSocialLink)) {
        form.setError('otherSocialLink', { message: 'Please enter a valid URL starting with http:// or https://' });
        return;
      }

      if (!values.quote?.trim()) {
        form.setError('quote', { message: 'Quote is required' });
        return;
      }

      if (!values.prompt?.trim()) {
        form.setError('prompt', { message: 'Personality prompt is required' });
        return;
      }

      // Only require image for new models
      if (!initialData?.id && !selectedFile) {
        toast.error('Please upload a profile image');
        return;
      }
      
      // Clean up URLs by ensuring they start with http:// or https://
      const cleanUrl = (url: string) => {
        if (!url?.trim()) return '';
        return url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
      };

      // Prepare form data
      const modelData = {
        ...values,
        chatLink: cleanUrl(values.chatLink),
        instagramLink: cleanUrl(values.instagramLink),
        otherSocialLink: cleanUrl(values.otherSocialLink),
        languages: values.languages.split(',').map(lang => lang.trim()),
        categories: selectedCategories,
        characteristics: characteristics.reduce((acc, { key, value }) => {
          if (key.trim() && value.trim()) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        }, {} as Record<string, string>),
        imageFile: selectedFile || undefined,
        ...(initialData?.profileImage && !selectedFile && { profileImage: initialData.profileImage }),
        ...(initialData?.id && { id: initialData.id }),
        voice: values.voice
      };

      console.log('Submitting model data:', modelData);
      await onSubmit(modelData);
    } catch (error) {
      console.error('Error submitting form:', error);
      const message = error instanceof Error ? error.message : 'Failed to save model profile';
      toast.error(message);
    }
  };

  const handleFillDebugData = () => {
    form.reset({
      firstName: 'Anna',
      lastName: 'Smith',
      nickname: 'anna_smith',
      quote: 'Living life to the fullest and enjoying every moment',
      height: 170,
      weight: 55,
      prompt: 'You are a friendly and outgoing person who loves to travel and meet new people. You have a great sense of humor and always try to see the positive side of things.',
      languages: 'English, Spanish, French',
      chatLink: 'https://t.me/anna_smith',
      instagramLink: 'https://instagram.com/anna_smith',
      otherSocialLink: 'https://twitter.com/anna_smith',
      price: 50,
      price_photo: 100,
      price_voice: 75,
      price_video: 150,
      isActive: true,
    });

    setCharacteristics([
      { key: 'Eye Color', value: 'Blue' },
      { key: 'Hair Color', value: 'Blonde' },
      { key: 'Zodiac Sign', value: 'Leo' },
    ]);

    if (categories.length > 0) {
      const randomCategories = categories
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.id);
      setSelectedCategories(randomCategories);
      form.setValue('categories', randomCategories);
    }

    toast.success('Debug data filled');
  };

  return (
    <Form {...form}>
      <form 
        key={initialData?.id || 'new-form'}
        onSubmit={form.handleSubmit(handleSubmit)} 
        className={cn("space-y-8", className)}
        autoFocus={false}
      >
        <div className="space-y-6">
          <ProfileImage
            previewImage={previewImage}
            onImageChange={handleImageChange}
          />

          <BasicInfo form={form} />
          <Status form={form} />
          <Personality form={form} />
          <CategoriesSection
            form={form}
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />
          <VoiceSettings form={form} modelId={initialData?.id} />
          <Characteristics
            characteristics={characteristics}
            setCharacteristics={setCharacteristics}
          />
          <SocialLinks form={form} />
          <Pricing form={form} />
        </div>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="send_voice_chance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voice Message Chance (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Probability of sending voice messages instead of text (0-101)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="p-6 border-t space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Model Profile' : 'Create Model Profile'}
          </Button>
          {showDebug && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleFillDebugData}
            >
              Fill Debug Data
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}