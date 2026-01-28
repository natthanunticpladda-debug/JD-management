import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ActivityLog, ActivityAction, ActivityEntityType } from '../types';
import toast from 'react-hot-toast';

// Helper function to log activity (can be used from other hooks)
export const logActivity = async (
  userId: string,
  action: ActivityAction,
  entityType: ActivityEntityType,
  entityId: string | null,
  description: string,
  metadata?: Record<string, any>
) => {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        description,
        metadata: metadata || {},
      });

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

export const useActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user:users(id, full_name, email, role)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      // Don't show error toast if table doesn't exist yet
      if (!error.message?.includes('does not exist')) {
        toast.error('Failed to load activity logs');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    logs,
    loading,
    refetch: fetchActivityLogs,
    logActivity,
  };
};
