import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Volume2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Voice } from '@/types'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { getModelVoice, deleteVoice, createVoice, updateVoice } from '@/lib/voices';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VoiceSettingsProps {
  modelId?: string; 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVoiceChange?: () => void;
}

export function VoiceSettings({ modelId, open, onOpenChange, onVoiceChange }: VoiceSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [voice, setVoice] = useState<Voice | null>(null);
  const [speed, setSpeed] = useState(1);
  const [style, setStyle] = useState(0);
  const [stability, setStability] = useState(0);
  const [similarityBoost, setSimilarityBoost] = useState(0);
  const [useSpeakerBoost, setUseSpeakerBoost] = useState(true);
  const [elevenlabsVoiceId, setElevenlabsVoiceId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (modelId) {
      loadVoice();
    }
  }, [modelId]);

  const loadVoice = async () => {
    try {
      setLoading(true);
      const voice = await getModelVoice(modelId);
      setVoice(voice);
      if (voice) { 
        setSpeed(voice.speed);
        setStyle(voice.style);
        setStability(voice.stability);
        setSimilarityBoost(voice.similarityBoost);
        setUseSpeakerBoost(voice.useSpeakerBoost);
        setElevenlabsVoiceId(voice.elevenlabsVoiceId);
      }
    } catch (error) {
      console.error('Error loading voice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVoice = async () => {
    try {
      setDeleting(true);
      const voiceId = voice?.id;
      if (!voiceId) {
        toast.error('No voice settings to delete');
        return;
      }

      await deleteVoice(voiceId);
      
      setVoice(null);

      toast.success('Voice settings deleted successfully');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting voice:', error);
      toast.error('Failed to delete voice settings');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveVoice = async () => {
    try {
      setSaving(true);
      
      if (!elevenlabsVoiceId.trim()) {
        toast.error('ElevenLabs Voice ID is required');
        return;
      }
      
      const voiceData = {
        modelId,
        speed,
        style,
        stability,
        similarityBoost,
        useSpeakerBoost,
        elevenlabsVoiceId
      };

      if (voice?.id) {
        await updateVoice(voice.id, voiceData);
      } else {
        const newVoice = await createVoice(voiceData);
        setVoice(newVoice);
      }

      toast.success('Voice settings saved successfully');
      onVoiceChange?.();
    } catch (error) {
      console.error('Error saving voice:', error);
      toast.error('Failed to save voice settings');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      // Reset state when closing
      if (voice) {
        setSpeed(voice.speed);
        setStyle(voice.style);
        setStability(voice.stability);
        setSimilarityBoost(voice.similarityBoost);
        setUseSpeakerBoost(voice.useSpeakerBoost);
        setElevenlabsVoiceId(voice.elevenlabsVoiceId);
      }
      onOpenChange(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:w-auto max-w-2xl max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Voice Settings</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>ElevenLabs Voice ID</Label>
                <Input
                  required
                  value={elevenlabsVoiceId}
                  onChange={(e) => setElevenlabsVoiceId(e.target.value)}
                  placeholder="Enter ElevenLabs Voice ID"
                  className={cn(
                    "font-mono text-sm",
                    !elevenlabsVoiceId.trim() && "border-destructive"
                  )}
                />
                {!elevenlabsVoiceId.trim() && (
                  <p className="text-sm text-destructive mt-1.5">
                    ElevenLabs Voice ID is required
                  </p>
                )}
              </div>

              <div>
                <Label>Speed</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    min={0.7}
                    max={1.2}
                    step={0.01}
                    value={[speed]}
                    onValueChange={(value) => setSpeed(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={speed}
                    onChange={(e) => {
                      const value = Math.min(1.2, Math.max(0.7, Number(e.target.value)));
                      setSpeed(value);
                    }}
                    step={0.01}
                    className="w-20"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Adjust the speaking speed (0.7x - 1.2x)
                </p>
              </div>

              <div>
                <Label>Stability</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[stability]}
                    onValueChange={(value) => setStability(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={stability}
                    onChange={(e) => {
                      const value = Math.min(1, Math.max(0, Number(e.target.value)));
                      setStability(value);
                    }}
                    step={0.1}
                    className="w-20"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Higher values provide more consistent speech
                </p>
              </div>

              <div>
                <Label>Similarity Boost</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[similarityBoost]}
                    onValueChange={(value) => setSimilarityBoost(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={similarityBoost}
                    onChange={(e) => {
                      const value = Math.min(1, Math.max(0, Number(e.target.value)));
                      setSimilarityBoost(value);
                    }}
                    step={0.1}
                    className="w-20"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Higher values make the voice more expressive
                </p>
              </div>

              <div>
                <Label>Style</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[style]}
                    onValueChange={(value) => setStyle(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={style}
                    onChange={(e) => {
                      const value = Math.min(1, Math.max(0, Number(e.target.value)));
                      setStyle(value);
                    }}
                    step={0.1}
                    className="w-20"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Adjust the speaking style intensity
                </p>
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Speaker Boost</Label>
                  <p className="text-sm text-muted-foreground">
                    Enhance speaker consistency in longer text
                  </p>
                </div>
                <Switch
                  checked={useSpeakerBoost}
                  onCheckedChange={setUseSpeakerBoost}
                />
              </div>
            </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t">
              <div className="flex flex-col-reverse sm:flex-row items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveVoice}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                      Saving...
                    </>
                  ) : !elevenlabsVoiceId.trim() ? (
                    'ElevenLabs Voice ID Required'
                  ) : (
                    'Save Voice Settings'
                  )}
                </Button>
              </div>
            </div>
          {voice?.id && (
            <div className="pt-4 border-t mt-4">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Voice Settings
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voice Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the voice settings? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteVoice}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}