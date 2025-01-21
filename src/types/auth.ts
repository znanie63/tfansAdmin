export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Admin {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar: string | null;
  password?: string;
  created_at: string;
  updated_at: string;