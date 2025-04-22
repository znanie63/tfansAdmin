import { supabase } from './supabase';
import { Voice } from '@/types';

interface VoiceRecord {
  id: string;
  speed: number;
  style: number;
  model_id: string;
  stability: number;
  created_at: string;
  similarity_boost: number;
  use_speaker_boost: boolean;
  elevenlabs_voice_id: string;
}

function transformVoiceFromDB(record: VoiceRecord): Voice {
  return {
    id: record.id,
    speed: record.speed,
    style: record.style,
    modelId: record.model_id,
    stability: record.stability,
    similarityBoost: record.similarity_boost,
    useSpeakerBoost: record.use_speaker_boost,
    elevenlabsVoiceId: record.elevenlabs_voice_id,
    createdAt: new Date(record.created_at)
  };
}

function transformVoiceToDB(voice: Partial<Voice>): Partial<VoiceRecord> {
  return {
    speed: voice.speed,
    style: voice.style,
    model_id: voice.modelId,
    stability: voice.stability,
    similarity_boost: voice.similarityBoost,
    use_speaker_boost: voice.useSpeakerBoost,
    elevenlabs_voice_id: voice.elevenlabsVoiceId
  };
}

export async function createVoice(voice: Omit<Voice, 'id' | 'createdAt'>): Promise<Voice> {
  console.log('Creating voice with data:', voice);

  const { data, error } = await supabase
    .from('voices')
    .insert(transformVoiceToDB(voice))
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      // Voice already exists for this model, try updating instead
      const { data: existingVoice } = await supabase
        .from('voices')
        .select('*')
        .eq('model_id', voice.modelId)
        .single();

      if (existingVoice) {
        return updateVoice(existingVoice.id, voice);
      }
    }
    console.error('Error creating voice:', error);
    throw new Error('Failed to create voice');
  }

  return transformVoiceFromDB(data as VoiceRecord);
}

export async function updateVoice(id: string, voice: Partial<Voice>): Promise<Voice> {
  const { data, error } = await supabase
    .from('voices')
    .update(transformVoiceToDB(voice))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating voice:', error);
    throw new Error('Failed to update voice');
  }

  return transformVoiceFromDB(data as VoiceRecord);
}

export async function deleteVoice(id: string): Promise<void> {
  const { error } = await supabase
    .from('voices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting voice:', error);
    throw new Error('Failed to delete voice');
  }
}

export async function getModelVoice(modelId: string): Promise<Voice | null> {
  const { data, error } = await supabase
    .from('voices')
    .select('*')
    .eq('model_id', modelId);

  if (error) {
    console.error('Error fetching voice:', error);
    throw new Error('Failed to fetch voice');
  }

  // If no voice found, return null
  if (!data || data.length === 0) {
    return null;
  }

  // Return the first voice (there should only be one per model)
  return transformVoiceFromDB(data[0] as VoiceRecord);
}