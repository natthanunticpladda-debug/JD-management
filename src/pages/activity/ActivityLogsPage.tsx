import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import {
  Search,
  FileText,
  Users,
  Settings,
  Shield,
  Activity,
  Clock,
} from 'lucide-react';

export const ActivityLogsPage = () => {
  const { user: currentUser } = useAuth();
  const { logs, loading } = useActivityLogs();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const isAdmin = currentUser?.role === 'admin';

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_id?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (entityFilter !== 'all' && log.entity_type !== entityFilter) return false;

    return true;
  });

  const getActionBadge = (action: string) => {
    const styles = {
      create: 'bg-green-100 text-green-600',
      update: 'bg-blue-100 text-blue-600',
      delete: 'bg-red-100 text-red-600',
      publish: 'bg-purple-100 text-purple-600',
      archive: 'bg-yellow-100 text-yellow-600',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-caption font-medium ${styles[action as keyof typeof styles] || 'bg-gray-100 text-gray-600'}`}>
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </span>
    );
  };

  const getEntityIcon = (entityType: string) => {
    const icons = {
      job_description: <FileText className="w-4 h-4" />,
      user: <Users className="w-4 h-4" />,
      location: <Settings className="w-4 h-4" />,
      department: <Settings className="w-4 h-4" />,
      team: <Settings className="w-4 h-4" />,
      competency: <Settings className="w-4 h-4" />,
    };

    return icons[entityType as keyof typeof icons] || <Activity className="w-4 h-4" />;
  };

  const getEntityTypeBadge = (entityType: string) => {
    const labels = {
      job_description: 'Job Description',
      user: 'User',
      location: 'Location',
      department: 'Department',
      team: 'Team',
      competency: 'Competency',
    };

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-caption font-medium bg-primary-50 text-primary-600">
        {getEntityIcon(entityType)}
        {labels[entityType as keyof typeof labels] || entityType}
      </span>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <Shield className="w-16 h-16 text-primary-300 mx-auto mb-4" />
        <h2 className="text-heading-2 font-semibold text-primary-600 mb-2">Access Denied</h2>
        <p className="text-body text-primary-400">
          You don't have permission to view activity logs.
        </p>
      </div>
    );
  }

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
        <h1 className="text-heading-1 font-semibold text-primary-600">Activity Logs</h1>
        <p className="text-body text-primary-400 mt-2">
          {filteredLogs.length} {filteredLogs.length === 1 ? 'activity' : 'activities'} found
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
            <Input
              placeholder="Search by user, description, or entity ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="publish">Publish</option>
            <option value="archive">Archive</option>
          </Select>

          <Select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
            <option value="all">All Entities</option>
            <option value="job_description">Job Descriptions</option>
            <option value="user">Users</option>
            <option value="location">Locations</option>
            <option value="department">Departments</option>
            <option value="team">Teams</option>
            <option value="competency">Competencies</option>
          </Select>
        </div>
      </div>

      {/* Activity Timeline */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100">
          <Activity className="w-16 h-16 text-primary-300 mx-auto mb-4" />
          <p className="text-body text-primary-400 mb-4">
            {searchQuery || actionFilter !== 'all' || entityFilter !== 'all'
              ? 'No activities match your filters.'
              : 'No activities found.'}
          </p>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 bg-white/40 rounded-xl border border-primary-100 hover:bg-white/60 transition-colors"
              >
                {/* Avatar/Icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center text-white font-semibold text-body-sm shadow-apple">
                  {log.user?.full_name?.charAt(0).toUpperCase() || '?'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-body-sm font-semibold text-primary-600">
                          {log.user?.full_name || 'Unknown User'}
                        </span>
                        {getActionBadge(log.action)}
                        {getEntityTypeBadge(log.entity_type)}
                      </div>
                      <p className="text-body text-primary-500 break-words">
                        {log.description}
                      </p>
                      {log.entity_id && (
                        <p className="text-caption text-primary-400 mt-1 font-mono">
                          ID: {log.entity_id}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata Details */}
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-3 p-3 bg-primary-50/50 rounded-lg">
                      <p className="text-caption font-medium text-primary-600 mb-2">Details:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <div key={key} className="text-caption text-primary-500">
                            <span className="font-medium">{key}:</span>{' '}
                            <span className="break-words">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 mt-2 text-caption text-primary-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(log.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
