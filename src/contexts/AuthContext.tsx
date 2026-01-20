import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

type UserJobGrade = '1.1' | '1.2' | '2.1' | '2.2' | '3.1' | '3.2' | '5';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'viewer';
  job_grade: UserJobGrade | null;
  team_id: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Timeout fallback - if loading takes more than 5 seconds, stop loading
    // This prevents infinite loading if Supabase connection fails
    const timeoutId = setTimeout(() => {
      if (!initialized) {
        console.warn('Auth loading timeout - stopping loading state');
        setLoading(false);
        setInitialized(true);
      }
    }, 5000);

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setInitialized(true);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Error getting session:', error);
      setLoading(false);
      setInitialized(true);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Try to get user profile WITHOUT job_grade first (for backwards compatibility)
      let { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, team_id')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // Only throw if it's not a "no rows" error
        console.error('Error loading user profile:', error);
        // Sign out on profile fetch error to prevent infinite loops
        await supabase.auth.signOut();
        setUser(null);
        setLoading(false);
        return;
      }

      if (data) {
        // User profile exists - set user with job_grade as null for now
        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role as 'admin' | 'manager' | 'viewer',
          job_grade: null, // Will be null until migration is run
          team_id: data.team_id,
        });
      } else {
        // User profile doesn't exist - create it
        const { data: authUser } = await supabase.auth.getUser();

        if (authUser.user) {
          const newUser = {
            id: authUser.user.id,
            email: authUser.user.email || '',
            full_name: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0] || 'User',
            role: 'viewer' as const,
            job_grade: null,
            team_id: null,
          };

          const { error: insertError } = await supabase
            .from('users')
            .insert([newUser]);

          if (insertError) {
            console.error('Error creating user profile:', insertError);
            // Sign out on insert error
            await supabase.auth.signOut();
            setUser(null);
            setLoading(false);
            return;
          }

          // Set the newly created user
          setUser(newUser);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Sign out on any unexpected error
      await supabase.auth.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await fetchUserProfile(data.user.id);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // Create user profile in users table
    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert([
        {
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          role: 'viewer', // Default role
        },
      ]);

      if (profileError) throw profileError;
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
