import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalJDs: number;
  publishedJDs: number;
  draftJDs: number;
  archivedJDs: number;
  totalUsers: number;
  activeUsers: number;
  totalDepartments: number;
  totalTeams: number;
  recentActivities: number;
  jdsByDepartment: Array<{ name: string; count: number }>;
  jdsByStatus: Array<{ status: string; count: number }>;
  jdsByDepartmentAndStatus: Array<{ 
    name: string; 
    published: number; 
    draft: number; 
    archived: number;
    total: number;
  }>;
  topCompetencies: Array<{ name: string; count: number }>;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalJDs: 0,
    publishedJDs: 0,
    draftJDs: 0,
    archivedJDs: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalDepartments: 0,
    totalTeams: 0,
    recentActivities: 0,
    jdsByDepartment: [],
    jdsByStatus: [],
    jdsByDepartmentAndStatus: [],
    topCompetencies: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch JD stats
      const { data: jds, error: jdError } = await supabase
        .from('job_descriptions')
        .select('id, status, department_id, department:departments(name)');

      if (jdError) throw jdError;

      // Count JDs by status
      const totalJDs = jds?.length || 0;
      const publishedJDs = jds?.filter((jd) => jd.status === 'published').length || 0;
      const draftJDs = jds?.filter((jd) => jd.status === 'draft').length || 0;
      const archivedJDs = jds?.filter((jd) => jd.status === 'archived').length || 0;

      // Count JDs by department
      const deptCounts = jds?.reduce((acc: Record<string, number>, jd: any) => {
        const deptName = jd.department?.name || 'Unknown';
        acc[deptName] = (acc[deptName] || 0) + 1;
        return acc;
      }, {});

      const jdsByDepartment = Object.entries(deptCounts || {})
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // JDs by status for chart
      const jdsByStatus = [
        { status: 'Published', count: publishedJDs },
        { status: 'Draft', count: draftJDs },
        { status: 'Archived', count: archivedJDs },
      ];

      // Count JDs by department AND status (for stacked bar chart)
      const deptStatusCounts = jds?.reduce((acc: Record<string, { published: number; draft: number; archived: number }>, jd: any) => {
        const deptName = jd.department?.name || 'Unknown';
        if (!acc[deptName]) {
          acc[deptName] = { published: 0, draft: 0, archived: 0 };
        }
        if (jd.status === 'published') acc[deptName].published++;
        else if (jd.status === 'draft') acc[deptName].draft++;
        else if (jd.status === 'archived') acc[deptName].archived++;
        return acc;
      }, {});

      const jdsByDepartmentAndStatus = Object.entries(deptStatusCounts || {})
        .map(([name, counts]) => ({
          name,
          published: counts.published,
          draft: counts.draft,
          archived: counts.archived,
          total: counts.published + counts.draft + counts.archived,
        }))
        .sort((a, b) => b.total - a.total);

      // Fetch user stats
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, is_active');

      if (userError) throw userError;

      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter((u) => u.is_active).length || 0;

      // Fetch department count
      const { count: deptCount, error: deptError } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true });

      if (deptError) throw deptError;

      // Fetch team count
      const { count: teamCount, error: teamError } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true });

      if (teamError) throw teamError;

      // Fetch recent activities count (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: activityCount, error: activityError } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      if (activityError) throw activityError;

      // Fetch top competencies
      const { data: jdCompetencies, error: compError } = await supabase
        .from('jd_competencies')
        .select('competency_id, competency:competencies(name)');

      if (compError) throw compError;

      const compCounts = jdCompetencies?.reduce((acc: Record<string, number>, jc: any) => {
        const compName = jc.competency?.name || 'Unknown';
        acc[compName] = (acc[compName] || 0) + 1;
        return acc;
      }, {});

      const topCompetencies = Object.entries(compCounts || {})
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalJDs,
        publishedJDs,
        draftJDs,
        archivedJDs,
        totalUsers,
        activeUsers,
        totalDepartments: deptCount || 0,
        totalTeams: teamCount || 0,
        recentActivities: activityCount || 0,
        jdsByDepartment,
        jdsByStatus,
        jdsByDepartmentAndStatus,
        topCompetencies,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    refetch: fetchDashboardStats,
  };
};
