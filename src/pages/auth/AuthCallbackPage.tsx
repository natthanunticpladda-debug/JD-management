import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if Supabase has already handled the OAuth callback
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (sessionData.session) {
          // Session already exists (Supabase handled it automatically)
          toast.success('เข้าสู่ระบบสำเร็จ!');
          navigate('/dashboard', { replace: true });
          return;
        }

        // Fallback: Try to get tokens from URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          // Set the session with the tokens from Microsoft
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (error) throw error;

          if (data.session) {
            toast.success('เข้าสู่ระบบสำเร็จ!');
            navigate('/dashboard', { replace: true });
            return;
          }
        }

        // If we reach here, no session was found
        throw new Error('No authentication data found');
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setError(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        toast.error(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-yellow-100 to-primary-50">
      <div className="text-center">
        {error ? (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-lg text-red-600 font-medium mb-2">{error}</p>
            <p className="text-sm text-gray-500">กำลังกลับไปหน้า Login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-lg text-primary-600 font-medium">กำลังเข้าสู่ระบบ...</p>
          </>
        )}
      </div>
    </div>
  );
};
