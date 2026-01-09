import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useJobDescriptions } from '../../hooks/useJobDescriptions';
import { useLocations } from '../../hooks/useLocations';
import { useDepartments } from '../../hooks/useDepartments';
import { useTeams } from '../../hooks/useTeams';
import { useCompetencies } from '../../hooks/useCompetencies';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { CompetencyRadarChart } from '../../components/CompetencyRadarChart';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Archive,
  FileText,
  Calendar,
  MapPin,
  Building2,
  Users,
  User,
  Download,
  Share2,
  Printer,
} from 'lucide-react';
import type { JobDescriptionAPI } from '../../types';

export const ViewJDPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getJobDescription, deleteJobDescription, archiveJobDescription } = useJobDescriptions();
  const { locations } = useLocations();
  const { departments } = useDepartments();
  const { teams } = useTeams();
  const { competencies } = useCompetencies();

  const [jd, setJd] = useState<JobDescriptionAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    if (id) {
      loadJobDescription();
    }
  }, [id]);

  const loadJobDescription = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await getJobDescription(id);
      if (data) {
        setJd(data);
      } else {
        navigate('/job-descriptions');
      }
    } catch (error) {
      navigate('/job-descriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!jd) return;
    try {
      await deleteJobDescription(jd.id);
      navigate('/job-descriptions');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleArchive = async () => {
    if (!jd) return;
    try {
      await archiveJobDescription(jd.id);
      await loadJobDescription(); // Reload to show updated status
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || 'Unknown';
  };

  const getDepartmentName = (departmentId: string) => {
    return departments.find(dept => dept.id === departmentId)?.name || 'Unknown';
  };

  const getTeamName = (teamId: string) => {
    return teams.find(team => team.id === teamId)?.name || 'Unknown';
  };

  const getCompetencyName = (competencyId: string) => {
    return competencies.find(comp => comp.id === competencyId)?.name || 'Unknown';
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  if (!jd) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <FileText className="w-16 h-16 text-primary-300 mx-auto mb-4" />
        <p className="text-body text-primary-400 mb-4">Job description not found.</p>
        <Link to="/job-descriptions">
          <Button icon={<ArrowLeft className="w-5 h-5" />}>
            Back to Browse
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link to="/job-descriptions">
          <Button
            variant="secondary"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to List
          </Button>
        </Link>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Print
          </Button>
          <Button
            variant="ghost"
            icon={<Download className="w-4 h-4" />}
          >
            Export PDF
          </Button>
          <Button
            variant="ghost"
            icon={<Share2 className="w-4 h-4" />}
          >
            Share
          </Button>
          {canEdit && jd.status !== 'archived' && (
            <Button
              variant="ghost"
              onClick={handleArchive}
              icon={<Archive className="w-4 h-4" />}
              className="text-yellow-600 hover:text-yellow-700"
            >
              Archive
            </Button>
          )}
          {canEdit && (
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm(true)}
              icon={<Trash2 className="w-4 h-4" />}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Job Description Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-500 to-accent-600 px-8 py-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{jd.position}</h1>
              <div className="flex items-center space-x-4 text-accent-100">
                <span>{jd.job_band} • {jd.job_grade}</span>
                <span>•</span>
                <span className="flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  {getDepartmentName(jd.department_id)}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {getLocationName(jd.location_id)}
                </span>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              {getStatusBadge(jd.status)}
              <div className="text-accent-100 text-sm">
                Updated {formatDate(jd.updated_at)}
              </div>
              {canEdit && (
                <Link to={`/jd/${jd.id}/edit`}>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-primary-600 mb-3">Basic Information</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-primary-400 mr-2" />
                  <span className="text-sm text-primary-500">Team:</span>
                  <span className="ml-2 text-sm font-medium">{getTeamName(jd.team_id)}</span>
                </div>
                {jd.direct_supervisor && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-primary-400 mr-2" />
                    <span className="text-sm text-primary-500">Direct Supervisor:</span>
                    <span className="ml-2 text-sm font-medium">{jd.direct_supervisor}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-primary-400 mr-2" />
                  <span className="text-sm text-primary-500">Created:</span>
                  <span className="ml-2 text-sm font-medium">{formatDate(jd.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Purpose */}
          <div>
            <h3 className="text-lg font-semibold text-primary-600 mb-3">Job Purpose</h3>
            <p className="text-primary-700 leading-relaxed">{jd.job_purpose}</p>
          </div>

          {/* Responsibilities */}
          {jd.responsibilities && jd.responsibilities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-primary-600 mb-4">Responsibilities</h3>
              <div className="space-y-4">
                {Object.entries(
                  jd.responsibilities.reduce((acc, resp) => {
                    if (!acc[resp.category]) acc[resp.category] = [];
                    acc[resp.category].push(resp);
                    return acc;
                  }, {} as Record<string, typeof jd.responsibilities>)
                ).map(([category, items]) => (
                  <div key={category} className="bg-primary-50/50 rounded-lg p-4">
                    <h4 className="font-medium text-primary-600 mb-2 capitalize">
                      {category.replace('_', ' ')}
                    </h4>
                    <ul className="space-y-1">
                      {items.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary-400 mr-2">•</span>
                          <span className="text-primary-700">{item.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competencies */}
          {jd.competencies && jd.competencies.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-primary-600 mb-4">
                Core Competencies (สมรรถนะหลัก)
              </h3>
              
              {/* Spider Chart */}
              <div className="bg-white rounded-lg p-6 mb-6 border border-primary-100">
                <CompetencyRadarChart competencies={jd.competencies} />
              </div>

              {/* Competency Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jd.competencies.map((comp, index) => (
                  <div key={index} className="bg-primary-50/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-primary-600">
                        {getCompetencyName(comp.competency_id)}
                      </h4>
                      <span className={`font-bold ${getScoreColor(comp.score)}`}>
                        {comp.score}/5
                      </span>
                    </div>
                    {comp.notes && (
                      <p className="text-sm text-primary-500">{comp.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {jd.risks && jd.risks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-primary-600 mb-4">Risk Factors</h3>
              <div className="space-y-4">
                {/* External Risks */}
                {jd.risks.filter(r => r.type === 'external').length > 0 && (
                  <div className="rounded-lg overflow-hidden border border-red-200">
                    <div className="bg-red-50 px-4 py-2 border-l-4 border-red-500">
                      <h4 className="font-semibold text-red-600">External Risks</h4>
                    </div>
                    <ul className="p-4 space-y-2 bg-white">
                      {jd.risks.filter(r => r.type === 'external').map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-400 mr-2 mt-1">●</span>
                          <span className="text-gray-700">{item.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Internal Risks */}
                {jd.risks.filter(r => r.type === 'internal').length > 0 && (
                  <div className="rounded-lg overflow-hidden border border-blue-200">
                    <div className="bg-blue-50 px-4 py-2 border-l-4 border-blue-500">
                      <h4 className="font-semibold text-blue-600">Internal Risks</h4>
                    </div>
                    <ul className="p-4 space-y-2 bg-white">
                      {jd.risks.filter(r => r.type === 'internal').map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-400 mr-2 mt-1">●</span>
                          <span className="text-gray-700">{item.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Job Description</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{jd.position}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};