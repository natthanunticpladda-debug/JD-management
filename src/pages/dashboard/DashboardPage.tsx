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
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { stats, loading } = useDashboardStats();

  const COLORS = ['#22c55e', '#eab308', '#9ca3af'];

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* JDs by Status Pie Chart */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <h2 className="text-body-lg font-semibold text-primary-600 mb-6">JDs by Status</h2>
          {stats.jdsByStatus.some((item) => item.count > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.jdsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    name && percent && percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.jdsByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-primary-400">
              <p className="text-body-sm">No data available</p>
            </div>
          )}
        </div>

        {/* JDs by Department Bar Chart */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <h2 className="text-body-lg font-semibold text-primary-600 mb-6">
            Top Departments by JDs
          </h2>
          {stats.jdsByDepartment.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.jdsByDepartment}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#007AFF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-primary-400">
              <p className="text-body-sm">No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Competencies */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-accent-600" />
          <h2 className="text-body-lg font-semibold text-primary-600">
            Top 5 Most Required Competencies
          </h2>
        </div>
        {stats.topCompetencies.length > 0 ? (
          <div className="space-y-4">
            {stats.topCompetencies.map((comp, index) => (
              <div key={comp.name} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                  <span className="text-body-sm font-semibold text-accent-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-body font-medium text-primary-600">{comp.name}</span>
                    <span className="text-body-sm text-primary-400">{comp.count} JDs</span>
                  </div>
                  <div className="w-full bg-primary-100 rounded-full h-2">
                    <div
                      className="bg-accent-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(comp.count / stats.topCompetencies[0].count) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-primary-400">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-body-sm">No competency data available</p>
          </div>
        )}
      </div>
    </div>
  );
};
