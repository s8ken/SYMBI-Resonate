/**
 * Authentication Service
 * Handles user authentication with Supabase Auth
 */

import { SupabaseClient, User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  metadata?: Record<string, any>;
}

export type UserRole = 'admin' | 'researcher' | 'viewer';

export interface SignUpData {
  email: string;
  password: string;
  metadata?: {
    fullName?: string;
    organization?: string;
  };
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Sign up a new user
   */
  async signUp(data: SignUpData): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: data.metadata,
        },
      });

      if (error) throw error;

      // Create user profile in database
      if (authData.user) {
        await this.createUserProfile(authData.user.id, data.email, data.metadata);
      }

      return { user: authData.user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign in existing user
   */
  async signIn(data: SignInData): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data: authData, error } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      return { user: authData.user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  }

  /**
   * Get user role from database
   */
  async getUserRole(userId: string): Promise<UserRole> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return 'viewer'; // Default role
    }

    return data.role as UserRole;
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const role = await this.getUserRole(userId);
    return this.roleHasPermission(role, permission);
  }

  /**
   * Check if role has permission
   */
  private roleHasPermission(role: UserRole, permission: string): boolean {
    const permissions: Record<UserRole, string[]> = {
      admin: ['*'], // All permissions
      researcher: [
        'experiments.create',
        'experiments.read',
        'experiments.update',
        'experiments.delete',
        'analytics.read',
        'reports.create',
        'reports.read',
      ],
      viewer: [
        'experiments.read',
        'analytics.read',
        'reports.read',
      ],
    };

    const rolePermissions = permissions[role] || [];
    return rolePermissions.includes('*') || rolePermissions.includes(permission);
  }

  /**
   * Create user profile in database
   */
  private async createUserProfile(
    userId: string,
    email: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.supabase.from('user_profiles').insert({
      id: userId,
      email,
      role: 'researcher', // Default role
      full_name: metadata?.fullName,
      organization: metadata?.organization,
      created_at: new Date().toISOString(),
    });
  }
}

/**
 * User profiles table schema (to be added to database)
 */
export const userProfilesSchema = `
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  full_name VARCHAR(255),
  organization VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT valid_role CHECK (role IN ('admin', 'researcher', 'viewer'))
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
`;