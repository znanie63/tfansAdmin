import { useEffect, useState } from 'react';
import { Database, MessageSquare, Sparkles, ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Categories } from './components/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getSettings, updateSetting } from '@/lib/settings';

export function Settings() {
  const [mainPrompt, setMainPrompt] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [photoChance, setPhotoChance] = useState('50');
  const [photoMatch, setPhotoMatch] = useState('50');
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [savingMessage, setSavingMessage] = useState(false);
  const [savingPhotoChance, setSavingPhotoChance] = useState(false);
  const [savingPhotoMatch, setSavingPhotoMatch] = useState(false);
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
      setPhotoMatch(settings.send_photo_match || '50');
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMainPrompt = async () => {
    try {
      setSavingPrompt(true);
      await updateSetting('system_prompt', mainPrompt);
      toast.success('Main prompt saved successfully');
    } catch (error) {
      toast.error('Failed to save main prompt');
    } finally {
      setSavingPrompt(false);
    }
  };

  const handleSaveWelcomeMessage = async () => {
    try {
      setSavingMessage(true);
      await updateSetting('start_message', welcomeMessage);
      toast.success('Welcome message saved successfully');
    } catch (error) {
      toast.error('Failed to save welcome message');
    } finally {
      setSavingMessage(false);
    }
  };

  const handleSavePhotoChance = async () => {
    try {
      setSavingPhotoChance(true);
      await updateSetting('send_photo_chance', photoChance);
      toast.success('Photo chance threshold saved successfully');
    } catch (error) {
      toast.error('Failed to save photo chance threshold');
    } finally {
      setSavingPhotoChance(false);
    }
  };

  const handleSavePhotoMatch = async () => {
    try {
      setSavingPhotoMatch(true);
      await updateSetting('send_photo_match', photoMatch);
      toast.success('Photo match threshold saved successfully');
    } catch (error) {
      toast.error('Failed to save photo match threshold');
    } finally {
      setSavingPhotoMatch(false);
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

      <Card>
        <CardContent className="p-6">
          <Categories />
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                  Main Prompt
                </CardTitle>
                <CardDescription>
                  Configure the main system prompt for all models
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Textarea
                value={mainPrompt}
                onChange={(e) => setMainPrompt(e.target.value)}
                placeholder="Enter the main system prompt that will be used as a base for all models..."
                className="min-h-[200px] font-mono text-sm"
              />
              <Button 
                onClick={handleSaveMainPrompt}
                disabled={savingPrompt}
                className="w-full sm:w-auto"
              >
                {savingPrompt ? 'Saving...' : 'Save Main Prompt'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  Welcome Message
                </CardTitle>
                <CardDescription>
                  Set the default welcome message for new chats
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Welcome Message</Label>
              <Textarea
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="Enter the welcome message that will be sent when a new chat starts..."
                className="min-h-[100px] font-mono text-sm"
              />
              <Button 
                onClick={handleSaveWelcomeMessage}
                disabled={savingMessage}
                className="w-full sm:w-auto"
              >
                {savingMessage ? 'Saving...' : 'Save Welcome Message'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  Photo Search Settings
                </CardTitle>
                <CardDescription>
                  Configure when to search for photos in the database
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Photo Search Chance Threshold</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step={1}
                  min={0}
                  max={100}
                  value={photoChance}
                  onChange={(e) => {
                    const value = Math.min(100, Math.max(0, Number(e.target.value)));
                    setPhotoChance(value.toString());
                  }}
                  className="font-mono text-sm"
                  onBlur={() => {
                    const value = Number(photoChance);
                    if (isNaN(value) || value < 0) {
                      setPhotoChance('0');
                    } else if (value > 100) {
                      setPhotoChance('100');
                    }
                  }}
                />
                <Button 
                  onClick={handleSavePhotoChance}
                  disabled={savingPhotoChance}
                  className="w-full sm:w-auto"
                >
                  {savingPhotoChance ? 'Saving...' : 'Save Threshold'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Search for photos in the database when the request chance is above this threshold (0-100).
                Higher values mean more selective search. Set to 0 to disable automatic search.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Photo Match Threshold</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step={1}
                  min={0}
                  max={100}
                  value={photoMatch}
                  onChange={(e) => {
                    const value = Math.min(100, Math.max(0, Number(e.target.value)));
                    setPhotoMatch(value.toString());
                  }}
                  className="font-mono text-sm"
                  onBlur={() => {
                    const value = Number(photoMatch);
                    if (isNaN(value) || value < 0) {
                      setPhotoMatch('0');
                    } else if (value > 100) {
                      setPhotoMatch('100');
                    }
                  }}
                />
                <Button 
                  onClick={handleSavePhotoMatch}
                  disabled={savingPhotoMatch}
                  className="w-full sm:w-auto"
                >
                  {savingPhotoMatch ? 'Saving...' : 'Save Threshold'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Minimum match percentage between photo description and user request (0-100).
                Photos with match score above this threshold will be considered as matches.
                Higher values require more precise matches.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  Database
                </CardTitle>
                <CardDescription>
                  View and manage your Supabase database connection
                </CardDescription>
              </div>
              <Badge variant="secondary" className="font-normal">
                Read Only
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Database URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={import.meta.env.VITE_SUPABASE_URL}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(import.meta.env.VITE_SUPABASE_URL);
                    toast.success('Database URL copied to clipboard');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Project ID</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={import.meta.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0]}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const projectId = import.meta.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0];
                    navigator.clipboard.writeText(projectId);
                    toast.success('Project ID copied to clipboard');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}