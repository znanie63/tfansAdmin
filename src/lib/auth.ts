import { supabase } from './supabase';
import { AuthUser, LoginCredentials, Admin } from '@/types/auth';

async function createAuthUser({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
    }
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('No user data returned');
  
  return data.user;
}

export async function loginWithCredentials({ email, password }: LoginCredentials): Promise<AuthUser> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error('No user data');

  // Check if user is admin
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', authData.user.id)
    .single();

  if (adminError) throw new Error('Not authorized as admin');

  return {
    id: authData.user.id,
    email: authData.user.email!,
    name: adminData.name,
    role: 'admin',
    avatar: adminData.avatar,
  };
}

export async function createAdmin(admin: Omit<Admin, 'id' | 'created_at' | 'updated_at'>): Promise<Admin> {
  try {
    // Create auth user
    const user = await createAuthUser({
      email: admin.email,
      password: admin.password,
    });

    // Then create admin record
    const { data, error } = await supabase
      .from('admins')
      .insert({
        user_id: user.id,
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
}

export async function getAdmins(): Promise<Admin[]> {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAdmin(id: string): Promise<void> {
  const { error: adminError } = await supabase
    .from('admins')
    .delete()
    .eq('id', id);

  if (adminError) throw new Error(adminError.message);
}