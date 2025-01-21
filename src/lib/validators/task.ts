import * as z from 'zod';
import { TaskType } from '@/types';

// Base schema for all task types
const baseSchema = z.object({
  type: z.enum(['social', 'referral', 'review', 'daily'] as const),
  title: z.string().min(1, 'Title is required'),
  reward: z.number().min(1, 'Reward must be at least 1 TFC'),
  daily_reset: z.boolean().optional(),
  // Optional fields that may be present for any type
  platform: z.string().optional(),
  url: z.string().optional(),
  referralCount: z.number().optional(),
  referralReward: z.number().optional(),
});

// Type refinement function
const refineTaskData = (data: z.infer<typeof baseSchema>) => {
  switch (data.type) {
    case 'social':
      if (!data.platform) {
        return { message: 'Platform is required for social tasks' };
      }
      if (!data.url) {
        return { message: 'URL is required for social tasks' };
      }
      break;
    case 'referral':
      if (!data.referralCount || data.referralCount < 1) {
        return { message: 'Number of referrals is required and must be at least 1' };
      }
      if (!data.referralReward || data.referralReward < 1) {
        return { message: 'Reward per referral is required and must be at least 1' };
      }
      break;
  }
  return true;
};

export const taskSchema = baseSchema.refine(refineTaskData, {
  message: "Invalid task data for the selected type"
});

export type TaskFormData = z.infer<typeof taskSchema>;

export const defaultValues: TaskFormData = {
  type: 'social',
  title: '',
  reward: 50,
  platform: '',
  url: '',
  referralCount: 0,
  referralReward: 0,
};