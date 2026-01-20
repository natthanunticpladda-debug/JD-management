import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobDescriptionsAPI } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, GitCompare } from 'lucide-react';
import type { JobDescriptionAPI } from '../../types';

export const CompareJDPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentVersion, setCurrentVersion] = useState<JobDescriptionAPI | null>(null);
  const [previousVersion, setPreviousVersion] = useState<JobDescriptionAPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadVersions();
    }
  }, [id]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      // Get current version
      const current = await jobDescriptionsAPI.getById(id!);
      setCurrentVersion(current);

      // Get previous version if exists
      if (current.parent_version_id) {
        const previous = await jobDescriptionsAPI.getById(current.parent_version_id);
        setPreviousVersion(previous);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderComparison = (label: string, before: any, after: any) => {
    const hasChanged = JSON.stringify(before) !== JSON.stringify(after);

    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-primary-600 mb-3">{label}</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Before */}
          <div className={`p-4 rounded-lg border ${hasChanged ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-xs font-medium text-gray-500 mb-2">BEFORE (Version {currentVersion?.version ? currentVersion.version - 1 : 0})</div>
            <div className={`text-sm ${hasChanged ? 'text-red-900' : 'text-gray-700'}`}>
              {typeof before === 'object' ? JSON.stringify(before, null, 2) : before || '-'}
            </div>
          </div>

          {/* After */}
          <div className={`p-4 rounded-lg border ${hasChanged ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-xs font-medium text-gray-500 mb-2">AFTER (Version {currentVersion?.version})</div>
            <div className={`text-sm ${hasChanged ? 'text-green-900' : 'text-gray-700'}`}>
              {typeof after === 'object' ? JSON.stringify(after, null, 2) : after || '-'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderArrayComparison = (label: string, before: any[], after: any[]) => {
    const hasChanged = JSON.stringify(before) !== JSON.stringify(after);

    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-primary-600 mb-3">{label}</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Before */}
          <div className={`p-4 rounded-lg border ${hasChanged ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-xs font-medium text-gray-500 mb-2">BEFORE (Version {currentVersion?.version ? currentVersion.version - 1 : 0})</div>
            <div className={`text-sm ${hasChanged ? 'text-red-900' : 'text-gray-700'} space-y-2`}>
              {before && before.length > 0 ? (
                before.map((item, idx) => (
                  <div key={idx} className="p-2 bg-white rounded border border-gray-200">
                    {typeof item === 'object' ? item.description || JSON.stringify(item) : item}
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No items</div>
              )}
            </div>
          </div>

          {/* After */}
          <div className={`p-4 rounded-lg border ${hasChanged ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-xs font-medium text-gray-500 mb-2">AFTER (Version {currentVersion?.version})</div>
            <div className={`text-sm ${hasChanged ? 'text-green-900' : 'text-gray-700'} space-y-2`}>
              {after && after.length > 0 ? (
                after.map((item, idx) => (
                  <div key={idx} className="p-2 bg-white rounded border border-gray-200">
                    {typeof item === 'object' ? item.description || JSON.stringify(item) : item}
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No items</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentVersion) {
    return (
      <div className="text-center py-20">
        <p className="text-body text-primary-400 mb-4">Job description not found</p>
        <Button onClick={() => navigate('/jd')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to List
        </Button>
      </div>
    );
  }

  if (!previousVersion) {
    return (
      <div className="text-center py-20">
        <p className="text-body text-primary-400 mb-4">No previous version available for comparison</p>
        <Button onClick={() => navigate('/jd')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/jd')} icon={<ArrowLeft className="w-5 h-5" />}>
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-primary-600">Compare Versions</h1>
            </div>
            <p className="text-primary-400 mt-1">{currentVersion.position}</p>
          </div>
        </div>
      </div>

      {/* Comparison Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 text-sm">
            <div className="px-3 py-1 bg-red-100 text-red-700 rounded-lg">
              Version {currentVersion.version - 1}
            </div>
            <span className="text-gray-400">→</span>
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg">
              Version {currentVersion.version}
            </div>
          </div>
        </div>

        {/* Basic Information */}
        {renderComparison('Position', previousVersion.position, currentVersion.position)}
        {renderComparison('Job Band', previousVersion.job_band, currentVersion.job_band)}
        {renderComparison('Job Grade', previousVersion.job_grade, currentVersion.job_grade)}
        {renderComparison('Direct Supervisor', previousVersion.direct_supervisor, currentVersion.direct_supervisor)}
        {renderComparison('Job Purpose', previousVersion.job_purpose, currentVersion.job_purpose)}
        {renderComparison('Status', previousVersion.status, currentVersion.status)}

        {/* Responsibilities */}
        {renderArrayComparison(
          'Responsibilities',
          previousVersion.responsibilities || [],
          currentVersion.responsibilities || []
        )}

        {/* Risks */}
        {renderArrayComparison(
          'Risks',
          previousVersion.risks || [],
          currentVersion.risks || []
        )}

        {/* Competencies */}
        {renderArrayComparison(
          'Competencies',
          previousVersion.competencies || [],
          currentVersion.competencies || []
        )}

        {/* Metadata */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-primary-600 mb-3">Change History</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Updated By</div>
              <div className="font-medium">{(currentVersion as any).updated_by_user?.full_name || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-gray-500">Updated At</div>
              <div className="font-medium">{new Date(currentVersion.updated_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
