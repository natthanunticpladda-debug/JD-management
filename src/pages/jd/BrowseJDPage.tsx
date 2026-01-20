import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useJobDescriptions } from '../../hooks/useJobDescriptions';
import { useLocations } from '../../hooks/useLocations';
import { useDepartments } from '../../hooks/useDepartments';
import { useJobBands } from '../../hooks/useJobBands';
import { useJobGrades } from '../../hooks/useJobGrades';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  MapPin,
  Building2,
  User,
} from 'lucide-react';
import type { JobDescriptionFilters, JDStatus, JobBand } from '../../types';

export const BrowseJDPage = () => {
  const { user } = useAuth();
  const { 
    jobDescriptions, 
    loading, 
    error, 
    fetchJobDescriptions, 
    deleteJobDescription, 
    publishJobDescription 
  } = useJobDescriptions();
  const { locations } = useLocations();
  const { departments } = useDepartments();
  const { jobBands } = useJobBands();
  const { jobGrades } = useJobGrades();

  const [filters, setFilters] = useState<JobDescriptionFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Helper function to check if user can edit a specific JD
  const canEditJD = (jd: any): boolean => {
    if (!user) return false;
    // Admin can edit everything
    if (user.role === 'admin') return true;
    // Manager can edit their own + team members' JDs
    if (user.role === 'manager') {
      return jd.created_by === user.id || (jd.team_id && jd.team_id === user.team_id);
    }
    // Viewer cannot edit
    return false;
  };

  // Helper function to check if user can publish a specific JD
  const canPublishJD = (jd: any): boolean => {
    if (!user) return false;
    // Only Manager can publish (not Admin, not Viewer)
    if (user.role === 'manager') {
      return jd.created_by === user.id || (jd.team_id && jd.team_id === user.team_id);
    }
    return false;
  };

  // Only Admin and Manager can create JD
  const canCreate = user?.role === 'admin' || user?.role === 'manager';

  // Get available job grades based on selected job band
  const getAvailableGrades = () => {
    if (!filters.jobBand) return [];
    const selectedBand = jobBands.find(b => b.name === filters.jobBand);
    if (!selectedBand) return [];
    return jobGrades.filter(g => g.job_band_id === selectedBand.id);
  };

  // Apply filters when they change
  useEffect(() => {
    fetchJobDescriptions(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, filters.departmentId, filters.locationId, filters.jobBand, filters.jobGrade]);

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search: search || undefined }));
  };

  const handleFilterChange = (key: keyof JobDescriptionFilters, value: string) => {
    // If changing job band, clear job grade
    if (key === 'jobBand') {
      setFilters(prev => ({ 
        ...prev, 
        jobBand: (value || undefined) as JobBand | undefined,
        jobGrade: undefined // Clear job grade when band changes
      }));
    } else {
      setFilters(prev => ({ 
        ...prev, 
        [key]: value || undefined 
      }));
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteJobDescription(id);
      setDeleteConfirm(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishJobDescription(id);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const getStatusBadge = (status: JDStatus) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getLocationName = (jd: any) => {
    // Try to get from relation first
    if (jd.location?.name) {
      return jd.location.name;
    }
    // Fallback to lookup in locations array
    return locations.find(loc => loc.id === jd.location_id)?.name || 'Unknown';
  };

  const getDepartmentName = (jd: any) => {
    // Try to get from relation first
    if (jd.department?.name) {
      return jd.department.name;
    }
    // Fallback to lookup in departments array
    return departments.find(dept => dept.id === jd.department_id)?.name || 'Unknown';
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <FileText className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <p className="text-body text-red-600 mb-4">{error}</p>
        <Button onClick={() => fetchJobDescriptions()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-600">Job Descriptions</h1>
          <p className="text-primary-400 mt-1">Manage and browse job descriptions</p>
        </div>
        {canCreate && (
          <Link to="/jd/create">
            <Button icon={<Plus className="w-5 h-5" />}>
              Create JD
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
              <Input
                placeholder="Search job descriptions..."
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
                value={filters.search || ''}
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="w-4 h-4" />}
          >
            Filters
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-primary-100">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select
                label="Status"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>

              <Select
                label="Department"
                value={filters.departmentId || ''}
                onChange={(e) => handleFilterChange('departmentId', e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Location"
                value={filters.locationId || ''}
                onChange={(e) => handleFilterChange('locationId', e.target.value)}
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Job Band"
                value={filters.jobBand || ''}
                onChange={(e) => handleFilterChange('jobBand', e.target.value)}
              >
                <option value="">All Job Bands</option>
                {jobBands.map((band) => (
                  <option key={band.id} value={band.name}>
                    {band.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Job Grade"
                value={filters.jobGrade || ''}
                onChange={(e) => handleFilterChange('jobGrade', e.target.value)}
                disabled={!filters.jobBand}
              >
                <option value="">All Job Grades</option>
                {getAvailableGrades().map((grade) => (
                  <option key={grade.id} value={grade.name}>
                    {grade.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
          </div>
        ) : jobDescriptions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-primary-300 mx-auto mb-4" />
            <p className="text-body text-primary-400 mb-4">No job descriptions found.</p>
            {canCreate && (
              <Link to="/jd/create">
                <Button icon={<Plus className="w-5 h-5" />}>
                  Create First JD
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50/50 border-b border-primary-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    Updated By
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-primary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {jobDescriptions.map((jd) => (
                  <tr key={jd.id} className="hover:bg-primary-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-primary-900">{jd.position}</div>
                        <div className="text-sm text-primary-500">{jd.job_band} • {jd.job_grade}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(jd.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-primary-600">
                        <Building2 className="w-4 h-4 mr-2" />
                        {getDepartmentName(jd)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-primary-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {getLocationName(jd)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-primary-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(jd.updated_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-primary-600">
                        <User className="w-4 h-4 mr-2" />
                        {(jd as any).updated_by_user?.full_name || (jd as any).created_by_user?.full_name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/jd/${jd.id}`}>
                          <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                            View
                          </Button>
                        </Link>

                        {canEditJD(jd) && (
                          <>
                            <Link to={`/jd/${jd.id}/edit`}>
                              <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />}>
                                Edit
                              </Button>
                            </Link>

                            {jd.status === 'draft' && canPublishJD(jd) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePublish(jd.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                Publish
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(jd.id)}
                              icon={<Trash2 className="w-4 h-4" />}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Job Description</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this job description? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};