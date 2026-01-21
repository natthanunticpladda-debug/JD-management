import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Clear any stale sessions on mount
  useEffect(() => {
    const clearStaleSession = async () => {
      try {
        // Check if there's a broken session
        const { data: { session } } = await supabase.auth.getSession();
        if (session && !user) {
          // If there's a session but no user profile, clear it
          console.log('Clearing stale session');
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    clearStaleSession();
  }, [user]);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleMicrosoftSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email',
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Microsoft sign in error:', error);
      toast.error(error.message || 'Failed to sign in with Microsoft');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-accent-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-apple-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl mb-4 shadow-apple">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-primary-600">
              Job Description Management
            </h1>
            <p className="mt-2 text-primary-400">เข้าสู่ระบบด้วย Microsoft Account</p>
          </div>

          {/* Microsoft Sign In Button */}
          <button
            type="button"
            onClick={handleMicrosoftSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-primary-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-apple"
          >
            <svg className="w-6 h-6" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0H10.9091V10.9091H0V0Z" fill="#F25022"/>
              <path d="M12.0909 0H23V10.9091H12.0909V0Z" fill="#7FBA00"/>
              <path d="M0 12.0909H10.9091V23H0V12.0909Z" fill="#00A4EF"/>
              <path d="M12.0909 12.0909H23V23H12.0909V12.0909Z" fill="#FFB900"/>
            </svg>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Microsoft'}
          </button>

          <p className="mt-6 text-center text-sm text-primary-400">
            กรุณาใช้ Microsoft Account ขององค์กรในการเข้าสู่ระบบ
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-primary-400">
          Job Description Management System
        </p>
      </div>
    </div>
  );
};
