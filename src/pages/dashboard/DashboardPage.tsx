import { useAuth } from '../../contexts/AuthContext';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  FileText,
  Users,
  Building2,
  UsersRound,
  Activity,
  CheckCircle,
  FileEdit,
  Archive,
  Plus,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-heading-1 font-semibold text-primary-600">
          Welcome back, {user?.full_name}!
        </h1>
        <p className="text-body text-primary-400 mt-2">
          Here's an overview of your Job Description Management System
        </p>
      </div>

      {/* Quick Actions */}
      {(user?.role === 'admin' || user?.role === 'manager') && (
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Link to="/jd/create">
              <Button icon={<Plus className="w-5 h-5" />}>Create New JD</Button>
            </Link>
            <Link to="/job-descriptions">
              <Button variant="secondary" icon={<FileText className="w-5 h-5" />}>
                Browse JDs
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total JDs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-accent-100 rounded-xl">
              <FileText className="w-6 h-6 text-accent-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-caption font-medium text-primary-400 mb-1">Total JDs</h3>
          <p className="text-heading-2 font-bold text-primary-600">{stats.totalJDs}</p>
        </div>

        {/* Published JDs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-caption font-medium text-primary-400 mb-1">Published</h3>
          <p className="text-heading-2 font-bold text-green-600">{stats.publishedJDs}</p>
        </div>

        {/* Draft JDs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <FileEdit className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-caption font-medium text-primary-400 mb-1">Drafts</h3>
          <p className="text-heading-2 font-bold text-yellow-600">{stats.draftJDs}</p>
        </div>

        {/* Archived JDs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-100 rounded-xl">
              <Archive className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <h3 className="text-caption font-medium text-primary-400 mb-1">Archived</h3>
          <p className="text-heading-2 font-bold text-gray-600">{stats.archivedJDs}</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-primary-400" />
            <h3 className="text-caption font-medium text-primary-400">Total Users</h3>
          </div>
          <p className="text-body-lg font-semibold text-primary-600">{stats.totalUsers}</p>
          <p className="text-caption text-green-600 mt-1">{stats.activeUsers} active</p>
        </div>

        {/* Departments */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-primary-400" />
            <h3 className="text-caption font-medium text-primary-400">Departments</h3>
          </div>
          <p className="text-body-lg font-semibold text-primary-600">{stats.totalDepartments}</p>
        </div>

        {/* Teams */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <UsersRound className="w-5 h-5 text-primary-400" />
            <h3 className="text-caption font-medium text-primary-400">Teams</h3>
          </div>
          <p className="text-body-lg font-semibold text-primary-600">{stats.totalTeams}</p>
        </div>

        {/* Recent Activities */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-primary-400" />
            <h3 className="text-caption font-medium text-primary-400">Activities (7d)</h3>
          </div>
          <p className="text-body-lg font-semibold text-primary-600">{stats.recentActivities}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="mb-8">
        {/* Combined JDs by Department and Status - Stacked Bar Chart */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <h2 className="text-body-lg font-semibold text-primary-600 mb-4">
            JDs by Department and Status
          </h2>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-caption text-primary-600">Published - พร้อมใช้งาน</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className="text-caption text-primary-600">Draft - ร่าง</span>
            </div>
          </div>

          {stats.jdsByDepartmentAndStatus.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stats.jdsByDepartmentAndStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '8px 12px',
                    }}
                    formatter={(value: number | undefined, name: string | undefined) => {
                      if (value === undefined || name === undefined) return ['', ''];
                      return [
                        `${value} JDs`,
                        name === 'published' ? 'Published (พร้อมใช้งาน)' : 
                        name === 'draft' ? 'Draft (ร่าง)' : name
                      ];
                    }}
                  />
                  <Bar dataKey="published" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]}>
                    <LabelList 
                      dataKey="published" 
                      position="inside" 
                      style={{ fill: 'white', fontSize: '12px', fontWeight: 'bold' }}
                      formatter={(value: any) => value > 0 ? value : ''}
                    />
                  </Bar>
                  <Bar dataKey="draft" stackId="a" fill="#eab308" radius={[8, 8, 0, 0]}>
                    <LabelList 
                      dataKey="draft" 
                      position="inside" 
                      style={{ fill: 'white', fontSize: '12px', fontWeight: 'bold' }}
                      formatter={(value: any) => value > 0 ? value : ''}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              {/* Summary Stats */}
              <div className="mt-6 pt-6 border-t border-primary-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-heading-3 font-bold text-primary-600">
                      {stats.jdsByDepartmentAndStatus.length}
                    </p>
                    <p className="text-caption text-primary-400 mt-1">Total Departments</p>
                  </div>
                  <div>
                    <p className="text-heading-3 font-bold text-green-600">{stats.publishedJDs}</p>
                    <p className="text-caption text-primary-400 mt-1">Published</p>
                  </div>
                  <div>
                    <p className="text-heading-3 font-bold text-yellow-600">{stats.draftJDs}</p>
                    <p className="text-caption text-primary-400 mt-1">Drafts</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-primary-400">
              <p className="text-body-sm">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
