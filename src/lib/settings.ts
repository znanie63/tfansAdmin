import { supabase } from './supabase';

export interface Setting {
  id: string;
  name: string;
  value: string;
}

const DEFAULT_SETTINGS = {
  system_prompt: 'You are a helpful AI assistant.',
  start_message: 'Hello! How can I help you today?'
};

export async function getSettings(): Promise<Record<string, string>> {
  // First, ensure settings exist
  await ensureSettings();

  const { data, error } = await supabase
    .from('settings')
    .select('name, value');

  if (error) {
    console.error('Error fetching settings:', error);
    throw new Error('Failed to fetch settings');
  }

  // Convert to record and fill in any missing defaults
  const settings = data.reduce((acc, setting) => {
    acc[setting.name] = setting.value;
    return acc;
  }, {} as Record<string, string>);

  // Add any missing default settings
  return {
    ...DEFAULT_SETTINGS,
    ...settings
  };
}

export async function updateSetting(name: string, value: string): Promise<void> {
  // First check if setting exists
  const { data: existing } = await supabase
    .from('settings')
    .select('id')
    .eq('name', name)
    .single();

  if (!existing) {
    // Create new setting
    const { error: insertError } = await supabase
      .from('settings')
      .insert({ name, value });

    if (insertError) {
      console.error('Error creating setting:', insertError);
      throw new Error('Failed to create setting');
    }
  } else {
    // Update existing setting
    const { error: updateError } = await supabase
      .from('settings')
      .update({ value })
      .eq('name', name);

    if (updateError) {
      console.error('Error updating setting:', updateError);
      throw new Error('Failed to update setting');
    }
  }
}

async function ensureSettings() {
  // Get all existing settings
  const { data: existing } = await supabase
    .from('settings')
    .select('name');

  const existingNames = new Set(existing?.map(s => s.name) || []);

  // Create any missing settings with default values
  const missingSettings = Object.entries(DEFAULT_SETTINGS)
    .filter(([name]) => !existingNames.has(name))
    .map(([name, value]) => ({
      name,
      value
    }));

  if (missingSettings.length > 0) {
    const { error } = await supabase
      .from('settings')
      .insert(missingSettings);

    if (error) {
      console.error('Error creating default settings:', error);
      throw new Error('Failed to create default settings');
    }
  }
}