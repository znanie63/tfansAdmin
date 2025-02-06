import { supabase } from './supabase';
import { startOfDay, startOfWeek, subDays, format, subWeeks } from 'date-fns';

interface UserStats {
  totalUsers: number;
  totalBalance: number;
  totalSpent: number;
}

export interface StatChange {
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface DashboardStats {
  totalModels: StatChange;
  activeTasks: StatChange;
  totalReviews: StatChange;
  totalUsers: StatChange;
}

export async function getUserStats(): Promise<UserStats> {
  try {
    // Get users count
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get all balance transactions
    const { data: transactions } = await supabase
      .from('balance')
      .select('amount, type');

    // Calculate total balance and spent
    const totalBalance = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
    const totalSpent = transactions
      ?.filter(tx => tx.type === 'token_deduction')
      ?.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;

    return {
      totalUsers: totalUsers || 0,
      totalBalance,
      totalSpent
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalUsers: 0,
      totalBalance: 0,
      totalSpent: 0
    };
  }
}
export interface TaskCompletionStats {
  taskName: string;
  taskType: string;
  data: {
    date: string;
    count: number;
  }[];
}

export async function getTaskCompletionStats(): Promise<TaskCompletionStats[]> {
  const startDate = subWeeks(new Date(), 2);

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, type');

  if (!tasks) return [];

  const stats = await Promise.all(tasks.map(async (task) => {
    const { data: completions } = await supabase
      .from(task.type === 'daily' ? 'daily_completions' : 'task_completions')
      .select('completed_at')
      .eq('task_id', task.id)
      .gte('completed_at', startDate.toISOString())
      .order('completed_at');

    if (!completions) return null;

    // Group completions by date
    const grouped = completions.reduce((acc, { completed_at }) => {
      const date = format(new Date(completed_at), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Fill in missing dates with 0
    const data = [];
    let currentDate = startDate;
    while (currentDate <= new Date()) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      data.push({
        date: dateStr,
        count: grouped[dateStr] || 0
      });
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    return {
      taskName: task.title,
      taskType: task.type,
      data
    };
  }));

  return stats.filter((s): s is TaskCompletionStats => s !== null);
}
async function getCountForPeriod(table: string, startDate: Date, endDate: Date, options: { status?: string } = {}) {
  const query = supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString())
    .lt('created_at', endDate.toISOString());

  if (options.status) {
    query.eq('status', options.status);
  }

  const { count } = await query;
  return count || 0;
}

function calculateChange(current: number, previous: number): { change: number; trend: 'up' | 'down' | 'neutral' } {
  if (previous === 0) return { change: 0, trend: 'neutral' };
  const change = current - previous;
  return {
    change,
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = startOfDay(subDays(now, 1));
  const thisWeek = startOfWeek(now);
  const lastWeek = startOfWeek(subDays(now, 7));

  // Get counts for today and yesterday
  const [
    modelsToday, modelsYesterday,
    tasksToday, tasksYesterday,
    reviewsToday, reviewsYesterday,
    usersToday, usersYesterday
  ] = await Promise.all([
    getCountForPeriod('models', today, now),
    getCountForPeriod('models', yesterday, today),
    getCountForPeriod('tasks', today, now, { status: 'active' }),
    getCountForPeriod('tasks', yesterday, today, { status: 'active' }),
    getCountForPeriod('reviews', today, now),
    getCountForPeriod('reviews', yesterday, today),
    getCountForPeriod('users', today, now),
    getCountForPeriod('users', yesterday, today)
  ]);

  // Get total counts
  const [
    { count: totalModels },
    { count: totalActiveTasks },
    { count: totalReviews },
    { count: totalUsers }
  ] = await Promise.all([
    supabase.from('models').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true })
  ]);

  return {
    totalModels: {
      current: totalModels || 0,
      previous: (totalModels || 0) - modelsToday,
      ...calculateChange(modelsToday, modelsYesterday)
    },
    activeTasks: {
      current: totalActiveTasks || 0,
      previous: (totalActiveTasks || 0) - tasksToday,
      ...calculateChange(tasksToday, tasksYesterday)
    },
    totalReviews: {
      current: totalReviews || 0,
      previous: (totalReviews || 0) - reviewsToday,
      ...calculateChange(reviewsToday, reviewsYesterday)
    },
    totalUsers: {
      current: totalUsers || 0,
      previous: (totalUsers || 0) - usersToday,
      ...calculateChange(usersToday, usersYesterday)
    }
  };
}