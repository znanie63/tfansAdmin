import { supabase } from './supabase';

export interface Payment {
  id: string;
  created_at: string;
  currency: string;
  total_amount: number;
  user_id: string;
  tier_id: string;
  user?: {
    username: string;
    photo_url: string;
  };
  tier?: {
    description: string;
    tokens: number;
  };
}

export interface TierStats {
  tier_id: string;
  description: string;
  total_amount: number;
  total_payments: number;
  total_tokens: number;
}

export async function getPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      id,
      created_at,
      total_amount,
      user:users!user_id (
        username,
        photo_url
      ),
      tier:tiers!tier_id (
        description,
        tokens
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payments:', error);
    throw new Error('Failed to fetch payments');
  }

  return data;
}

export async function getTierStats(): Promise<TierStats[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      tier_id,
      tier:tiers!tier_id (
        description,
        tokens
      ),
      total_amount
    `);

  if (error) {
    console.error('Error fetching tier stats:', error);
    throw new Error('Failed to fetch tier statistics');
  }

  // Group and aggregate stats by tier
  const stats = data.reduce((acc: Record<string, TierStats>, payment) => {
    if (!payment.tier_id || !payment.tier) return acc;

    if (!acc[payment.tier_id]) {
      acc[payment.tier_id] = {
        tier_id: payment.tier_id,
        description: payment.tier.description,
        total_amount: 0,
        total_payments: 0,
        total_tokens: 0
      };
    }

    acc[payment.tier_id].total_amount += payment.total_amount;
    acc[payment.tier_id].total_payments += 1;
    acc[payment.tier_id].total_tokens += payment.tier.tokens;

    return acc;
  }, {});

  return Object.values(stats).sort((a, b) => b.total_amount - a.total_amount);
}