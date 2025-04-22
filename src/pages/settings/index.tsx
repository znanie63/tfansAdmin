import { useEffect, useState } from 'react';
import { Database } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Categories } from './components/categories';
import { Blocking } from './components/blocking';
import { PricingSettings } from './components/pricing';
import { GeneralSettings } from './components/general-settings';
import { MediaSettings } from './components/media-settings';
import { toast } from 'sonner';
import { getSettings } from '@/lib/settings';

export function Settings() {
  const [mainPrompt, setMainPrompt] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [photoChance, setPhotoChance] = useState('50');
  const [videoChance, setVideoChance] = useState('50');
  const [voiceChance, setVoiceChance] = useState('50');
  const [photoMatch, setPhotoMatch] = useState('50');
  const [videoMatch, setVideoMatch] = useState('50');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await getSettings();
      setMainPrompt(settings.system_prompt || '');
      setWelcomeMessage(settings.start_message || '');
      setPhotoChance(settings.send_photo_chance || '0.5');
      setVideoChance(settings.send_video_chance || '50');
      setVoiceChance(settings.send_voice_chance || '50');
      setPhotoMatch(settings.send_photo_match || '50');
      setVideoMatch(settings.send_video_match || '50');
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Database className="h-8 w-8 text-primary/80" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="blocking">Blocking</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettings
            mainPrompt={mainPrompt}
            welcomeMessage={welcomeMessage}
            setMainPrompt={setMainPrompt}
            setWelcomeMessage={setWelcomeMessage}
          />
        </TabsContent>
        
        <TabsContent value="media" className="space-y-6">
          <MediaSettings
            photoChance={photoChance}
            photoMatch={photoMatch}
            videoChance={videoChance}
            videoMatch={videoMatch}
            voiceChance={voiceChance}
            setPhotoChance={setPhotoChance}
            setPhotoMatch={setPhotoMatch}
            setVideoChance={setVideoChance}
            setVideoMatch={setVideoMatch}
            setVoiceChance={setVoiceChance}
          />
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardContent className="p-6">
              <Categories />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocking">
          <Card>
            <CardContent className="p-6">
              <Blocking />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardContent className="p-6">
              <PricingSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}