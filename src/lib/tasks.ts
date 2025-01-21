import { supabase } from './supabase';
import { Task, TaskType } from '@/types';
import { TaskFormData } from './validators/task';

interface TaskRecord {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  platform?: string;
  url?: string;
  model_id?: string;
  referral_count?: number;
  referral_reward?: number;
  reward: number;
  reward_currency: 'TFC';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

function transformTaskFromDB(record: TaskRecord): Task {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    description: record.description,
    platform: record.platform,
    url: record.url,
    modelId: record.model_id,
    referralCount: record.referral_count,
    referralReward: record.referral_reward,
    reward: record.reward,
    rewardCurrency: record.reward_currency,
    status: record.status,
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
  };
}

function transformTaskToDB(task: Partial<Task>): Partial<TaskRecord> {
  return {
    type: task.type,
    title: task.title,
    description: task.description,
    daily_reset: task.type === 'daily' ? task.daily_reset : undefined,
    platform: task.platform || null,
    url: task.url || null,
    model_id: task.modelId || null,
    referral_count: task.referralCount || null,
    referral_reward: task.referralReward || null,
    reward: task.reward,
    reward_currency: 'TFC',
    status: task.status || 'active'
  };
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      completions:task_completions(count),
      daily_completions:daily_completions(count)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw new Error('Failed to fetch tasks');
  }

  return (data || []).map(record => ({
    ...transformTaskFromDB(record as TaskRecord),
    completionsCount: record.type === 'daily' 
      ? record.daily_completions?.[0]?.count || 0
      : record.completions?.[0]?.count || 0
  }));
}

export async function createTask(formData: TaskFormData): Promise<Task> {
  console.log('Creating task:', formData);

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...transformTaskToDB(formData),
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    if (error.message?.includes('daily task')) {
      throw new Error('Only one daily task can be active at a time. Please deactivate the existing daily task first.');
    }
    throw new Error('Failed to create task');
  }

  return transformTaskFromDB(data as TaskRecord);
}

export async function updateTask(id: string, task: Partial<Task>): Promise<Task> {
  console.log('Updating task:', { id, task });

  const { data, error } = await supabase
    .from('tasks')
    .update(transformTaskToDB(task))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    if (error.message?.includes('daily task')) {
      throw new Error('Only one daily task can be active at a time. Please deactivate the existing daily task first.');
    }
    throw new Error('Failed to update task');
  }

  return transformTaskFromDB(data as TaskRecord);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
    throw new Error('Failed to delete task');
  }
}