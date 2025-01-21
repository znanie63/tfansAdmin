import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task } from '@/types';
import { taskSchema, TaskFormData, defaultValues } from '@/lib/validators/task';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
}

export function TaskForm({ initialData, onSubmit, onCancel }: TaskFormProps) {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData ? {
      type: initialData.type,
      title: initialData.title,
      description: initialData.description,
      reward: initialData.reward || 50,
      ...(initialData.type === 'social' || initialData.type === 'model_follow' ? {
        platform: initialData.platform || '',
        url: initialData.url || '',
      } : {}),
      ...(initialData.type === 'referral' ? {
        referralCount: initialData.referralCount || 0,
        referralReward: initialData.referralReward || 0,
      } : {}),
    } : defaultValues,
  });

  const taskType = form.watch('type');

  useEffect(() => {
    // Reset form when type changes, preserving common fields
    const currentValues = form.getValues();
    form.reset({
      type: taskType,
      title: currentValues.title,
      description: currentValues.description,
      reward: currentValues.reward || 50,
      ...(taskType === 'social' || taskType === 'model_follow' ? {
        platform: '',
        url: '',
      } : {}),
      ...(taskType === 'referral' ? {
        referralCount: 0,
        referralReward: 0,
      } : {}),
    });
  }, [taskType, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="social">Social Media Follow</SelectItem>
                  <SelectItem value="referral">Referral Program</SelectItem>
                  <SelectItem value="review">Write Review</SelectItem>
                  <SelectItem value="daily">Daily Task</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {taskType === 'daily' && (
          <FormField
            control={form.control}
            name="daily_reset"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Daily Reset</FormLabel>
                  <FormDescription>
                    Task progress will reset every 24 hours
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {taskType === 'social' && (
          <>
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Instagram, Twitter, Telegram" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" placeholder="https://" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {taskType === 'referral' && (
          <>
            <FormField
              control={form.control}
              name="referralCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Referrals Needed</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      value={field.value || ''}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referralReward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reward per Referral (TFC)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      value={field.value || ''}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="reward"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Reward (TFC)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  value={field.value || ''}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2">
          <Button type="submit" className="flex-1">
            {initialData ? 'Update Task' : 'Create Task'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}