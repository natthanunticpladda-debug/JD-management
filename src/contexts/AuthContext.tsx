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
    console.log('[Auth Debug] 1. useEffect started');
    const startTime = Date.now();

    // Timeout fallback - if loading takes more than 5 seconds, stop loading
    // This prevents infinite loading if Supabase connection fails
    const timeoutId = setTimeout(() => {
      if (!initialized) {
        console.warn('[Auth Debug] TIMEOUT after 5 seconds - forcing stop');
        setLoading(false);
        setInitialized(true);
      }
    }, 5000);

    // Check active sessions and sets the user
    console.log('[Auth Debug] 2. Calling getSession()...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      const elapsed = Date.now() - startTime;
      console.log(`[Auth Debug] 3. getSession() returned after ${elapsed}ms`);
      console.log('[Auth Debug] 4. Session exists:', !!session);
      console.log('[Auth Debug] 5. Session user:', session?.user?.email || 'no user');

      setInitialized(true);
      if (session?.user) {
        console.log('[Auth Debug] 6. Calling fetchUserProfile...');
        fetchUserProfile(session.user.id);
      } else {
        console.log('[Auth Debug] 6. No session - setLoading(false)');
        setLoading(false);
      }
    }).catch((error) => {
      const elapsed = Date.now() - startTime;
      console.error(`[Auth Debug] ERROR in getSession() after ${elapsed}ms:`, error);
      setLoading(false);
      setInitialized(true);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[Auth Debug] onAuthStateChange event:', _event);
      console.log('[Auth Debug] onAuthStateChange session:', !!session);
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

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    console.log(`[Auth Debug] 7. fetchUserProfile started for userId: ${userId} (attempt ${retryCount + 1})`);
    const profileStartTime = Date.now();

    try {
      // Try to get user profile with timeout
      console.log('[Auth Debug] 8. Querying users table...');

      // Create a timeout promise (shorter timeout, 4 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), 4000);
      });

      // Race between query and timeout
      const queryPromise = supabase
        .from('users')
        .select('id, email, full_name, role, team_id')
        .eq('id', userId)
        .maybeSingle();

      const result = await Promise.race([queryPromise, timeoutPromise]);
      const { data, error } = result as { data: any; error: any };

      const elapsed = Date.now() - profileStartTime;
      console.log(`[Auth Debug] 9. Users query returned after ${elapsed}ms`);
      console.log('[Auth Debug] 10. Query result - data:', !!data, 'error:', error?.code || 'none');

      if (error && error.code !== 'PGRST116') {
        // Only throw if it's not a "no rows" error
        console.error('[Auth Debug] ERROR loading user profile:', error);
        // Sign out on profile fetch error to prevent infinite loops
        await supabase.auth.signOut();
        setUser(null);
        setLoading(false);
        return;
      }

      if (data) {
        console.log('[Auth Debug] 11. User profile found:', data.email);
        // User profile exists - set user with job_grade as null for now
        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role as 'admin' | 'manager' | 'viewer',
          job_grade: null, // Will be null until migration is run
          team_id: data.team_id,
        });
        console.log('[Auth Debug] 12. setUser() called, setLoading(false) will be called in finally');
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
      console.error(`[Auth Debug] Error fetching user profile (attempt ${retryCount + 1}):`, error);

      // Retry up to 3 times on timeout
      if (retryCount < 2) {
        console.log(`[Auth Debug] Retrying... (attempt ${retryCount + 2})`);
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchUserProfile(userId, retryCount + 1);
      }

      // After 3 attempts, give up but DON'T sign out - just stop loading
      console.error('[Auth Debug] All retry attempts failed, stopping loading');
      // Don't sign out - keep the session, just couldn't load profile
      // await supabase.auth.signOut();
      // setUser(null);
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
