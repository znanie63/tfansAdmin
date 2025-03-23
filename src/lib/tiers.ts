import { supabase } from './supabase';

export interface Tier {
  id: string;
  tokens: number;
  price: number;
  description: string;
  badge?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  invoice_link?: string;
}

export async function getTiers(): Promise<Tier[]> {
  const { data, error } = await supabase
    .from('tiers')
    .select('*')
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tiers:', error);
    throw new Error('Failed to fetch tiers');
  }

  return data;
}

export async function createTier(tier: Omit<Tier, 'id' | 'created_at' | 'updated_at' | 'position'>): Promise<Tier> {
  // First create the tier
  const { data: newTier, error: createError } = await supabase
    .from('tiers')
    .insert({
      tokens: tier.tokens,
      price: tier.price,
      description: tier.description,
      badge: tier.badge || null,
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating tier:', createError);
    throw new Error('Failed to create tier');
  }

  try {
    // Then generate invoice link for the new tier
    const updatedTier = await updateTierInvoiceLink(newTier.id);
    return updatedTier;
  } catch (error) {
    console.error('Error generating invoice link:', error);
    // Return the tier even if invoice link generation fails
    return newTier;
  }
}

export async function updateTier(id: string, tier: Partial<Tier>): Promise<Tier> {
  const { data, error } = await supabase
    .from('tiers')
    .update({
      tokens: tier.tokens,
      price: tier.price,
      description: tier.description,
      badge: tier.badge || null
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating tier:', error);
    throw new Error('Failed to update tier');
  }

  return data;
}

export async function updateTierStatus(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('tiers')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    console.error('Error updating tier status:', error);
    throw new Error('Failed to update tier status');
  }
}

export async function deleteTier(id: string): Promise<void> {
  const { error } = await supabase
    .from('tiers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting tier:', error);
    throw new Error('Failed to delete tier');
  }
}

async function generateInvoiceLink(tier: Tier): Promise<string> {
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch('https://bspffffstxngyydorhis.supabase.co/functions/v1/payments/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      title: tier.description,
      description: tier.description,
      payload: {
        tier_id: tier.id,
        tfc_amount: tier.tokens.toString()
      },
      amount: tier.price
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate invoice link');
  }

  const data = await response.json();
  return data.invoiceLink;
}

export async function updateTierInvoiceLink(id: string): Promise<Tier> {
  // First get the tier data
  const { data: tier, error: getTierError } = await supabase
    .from('tiers')
    .select('*')
    .eq('id', id)
    .single();

  if (getTierError) throw getTierError;

  // Generate invoice link
  const invoiceLink = await generateInvoiceLink(tier);

  // Update tier with new invoice link
  const { data, error } = await supabase
    .from('tiers')
    .update({ invoice_link: invoiceLink })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update tier invoice link');
  }

  return data;
}