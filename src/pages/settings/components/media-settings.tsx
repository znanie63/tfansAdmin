import { useState } from 'react';
import { ImageIcon, Video, Volume2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { updateSetting } from '@/lib/settings';

interface MediaSettingsProps {
  photoChance: string;
  photoMatch: string;
  videoChance: string;
  videoMatch: string;
  voiceChance: string;
  setPhotoChance: (value: string) => void;
  setPhotoMatch: (value: string) => void;
  setVideoChance: (value: string) => void;
  setVideoMatch: (value: string) => void;
  setVoiceChance: (value: string) => void;
}

export function MediaSettings({
  photoChance,
  photoMatch,
  videoChance,
  videoMatch,
  voiceChance,
  setPhotoChance,
  setPhotoMatch,
  setVideoChance,
  setVideoMatch,
  setVoiceChance
}: MediaSettingsProps) {
  const [savingPhotoChance, setSavingPhotoChance] = useState(false);
  const [savingPhotoMatch, setSavingPhotoMatch] = useState(false);
  const [savingVideoChance, setSavingVideoChance] = useState(false);
  const [savingVideoMatch, setSavingVideoMatch] = useState(false);
  const [savingVoiceChance, setSavingVoiceChance] = useState(false);

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

  const handleSaveVideoChance = async () => {
    try {
      setSavingVideoChance(true);
      await updateSetting('send_video_chance', videoChance);
      toast.success('Video chance threshold saved successfully');
    } catch (error) {
      toast.error('Failed to save video chance threshold');
    } finally {
      setSavingVideoChance(false);
    }
  };

  const handleSaveVideoMatch = async () => {
    try {
      setSavingVideoMatch(true);
      await updateSetting('send_video_match', videoMatch);
      toast.success('Video match threshold saved successfully');
    } catch (error) {
      toast.error('Failed to save video match threshold');
    } finally {
      setSavingVideoMatch(false);
    }
  };

  const handleSaveVoiceChance = async () => {
    try {
      setSavingVoiceChance(true);
      await updateSetting('send_voice_chance', voiceChance);
      toast.success('Voice chance threshold saved successfully');
    } catch (error) {
      toast.error('Failed to save voice chance threshold');
    } finally {
      setSavingVoiceChance(false);
    }
  };

  return (
    <div className="grid gap-6">
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
                <Video className="h-5 w-5 text-muted-foreground" />
                Video Search Settings
              </CardTitle>
              <CardDescription>
                Configure when to search for videos in the database
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Video Search Chance Threshold</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step={1}
                min={0}
                max={100}
                value={videoChance}
                onChange={(e) => {
                  const value = Math.min(100, Math.max(0, Number(e.target.value)));
                  setVideoChance(value.toString());
                }}
                className="font-mono text-sm"
                onBlur={() => {
                  const value = Number(videoChance);
                  if (isNaN(value) || value < 0) {
                    setVideoChance('0');
                  } else if (value > 100) {
                    setVideoChance('100');
                  }
                }}
              />
              <Button 
                onClick={handleSaveVideoChance}
                disabled={savingVideoChance}
                variant="outline"
                size="sm"
              >
                {savingVideoChance ? 'Saving...' : 'Save Threshold'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Search for videos in the database when the request chance is above this threshold (0-100).
              Higher values mean more selective search. Set to 0 to disable automatic search.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Video Match Threshold</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step={1}
                min={0}
                max={100}
                value={videoMatch}
                onChange={(e) => {
                  const value = Math.min(100, Math.max(0, Number(e.target.value)));
                  setVideoMatch(value.toString());
                }}
                className="font-mono text-sm"
                onBlur={() => {
                  const value = Number(videoMatch);
                  if (isNaN(value) || value < 0) {
                    setVideoMatch('0');
                  } else if (value > 100) {
                    setVideoMatch('100');
                  }
                }}
              />
              <Button 
                onClick={handleSaveVideoMatch}
                disabled={savingVideoMatch}
                variant="outline"
                size="sm"
              >
                {savingVideoMatch ? 'Saving...' : 'Save Threshold'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Minimum match percentage between video description and user request (0-100).
              Videos with match score above this threshold will be considered as matches.
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
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                Voice Message Settings
              </CardTitle>
              <CardDescription>
                Configure when models send voice messages
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Voice Message Chance Threshold</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step={1}
                min={0}
                max={100}
                value={voiceChance}
                onChange={(e) => {
                  const value = Math.min(100, Math.max(0, Number(e.target.value)));
                  setVoiceChance(value.toString());
                }}
                className="font-mono text-sm"
                onBlur={() => {
                  const value = Number(voiceChance);
                  if (isNaN(value) || value < 0) {
                    setVoiceChance('0');
                  } else if (value > 100) {
                    setVoiceChance('100');
                  }
                }}
              />
              <Button 
                onClick={handleSaveVoiceChance}
                disabled={savingVoiceChance}
                variant="outline"
                size="sm"
              >
                {savingVoiceChance ? 'Saving...' : 'Save Threshold'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Probability of models sending voice messages instead of text (0-100).
              Higher values increase the chance of receiving voice messages.
              Set to 0 to disable voice messages completely.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}