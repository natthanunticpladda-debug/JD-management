import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useJobDescriptions } from '../../hooks/useJobDescriptions';
import { useLocations } from '../../hooks/useLocations';
import { useDepartments } from '../../hooks/useDepartments';
import { useTeams } from '../../hooks/useTeams';
import { useCompetencies } from '../../hooks/useCompetencies';
import { useCompanyAssets } from '../../hooks/useCompanyAssets';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { CompetencyRadarChart } from '../../components/CompetencyRadarChart';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  MapPin,
  Building2,
  Users,
  User,
  Download,
  Share2,
  Printer,
  Info,
  Target,
  ClipboardList,
  Award,
  AlertTriangle,
  Lightbulb,
  UsersRound,
  Briefcase,
  Palette,
  Zap,
  MoreHorizontal,
  TrendingUp,
  MessageSquare,
  Eye,
  Brain,
  Compass,
  Globe,
  Home,
  Package,
} from 'lucide-react';
import type { JobDescriptionAPI } from '../../types';

export const ViewJDPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getJobDescription, deleteJobDescription } = useJobDescriptions();
  const { locations } = useLocations();
  const { departments } = useDepartments();
  const { teams } = useTeams();
  const { competencies } = useCompetencies();
  const { assets } = useCompanyAssets();

  const [jd, setJd] = useState<JobDescriptionAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  // Add print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          size: A4;
          margin: 20mm 15mm 15mm 15mm;
        }
        
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Hide navigation and non-essential elements */
        nav, .print\\:hidden {
          display: none !important;
        }
        
        /* Main container */
        .bg-white\\/60 {
          background: white !important;
          border: none !important;
          box-shadow: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Executive Header - Professional styling */
        .print-header {
          background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%) !important;
          color: white !important;
          padding: 20px 25px !important;
          margin: 0 0 15px 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
        }
        
        .print-header h1 {
          font-size: 24pt !important;
          font-weight: 700 !important;
          margin: 0 0 10px 0 !important;
          letter-spacing: -0.5px !important;
        }
        
        .print-header .text-accent-100 {
          font-size: 10pt !important;
          opacity: 0.95 !important;
          margin: 0 !important;
        }
        
        /* Content sections - Allow natural flow */
        .print-content {
          padding: 0 15px !important;
          max-width: 100% !important;
        }
        
        .print-content > div {
          margin-bottom: 15px !important;
        }
        
        /* Section headers - Keep with content */
        .print-section {
          page-break-inside: auto !important;
          break-inside: auto !important;
        }
        
        .print-section h3 {
          font-size: 14pt !important;
          font-weight: 600 !important;
          color: #1a1a1a !important;
          margin-top: 0 !important;
          margin-bottom: 12px !important;
          padding-bottom: 8px !important;
          border-bottom: 2px solid #007AFF !important;
          letter-spacing: -0.2px !important;
          page-break-after: avoid !important;
          orphans: 3 !important;
          widows: 3 !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        
        .print-section h3 svg {
          width: 18px !important;
          height: 18px !important;
          opacity: 0.8 !important;
        }
        
        /* Content boxes - Allow breaking if needed */
        .bg-primary-50\\/50 {
          background: #f8f9fa !important;
          border: 1px solid #e1e4e8 !important;
          border-radius: 6px !important;
          padding: 16px 20px !important;
          margin-bottom: 12px !important;
          page-break-inside: auto !important;
          overflow: visible !important;
        }
        
        /* Text styling for readability */
        .text-primary-600, .text-primary-700 {
          color: #2c3e50 !important;
          line-height: 1.6 !important;
        }
        
        .text-primary-400, .text-primary-500 {
          color: #5a6c7d !important;
        }
        
        /* Lists - Better spacing and allow breaks */
        ul {
          margin: 8px 0 !important;
          padding-left: 20px !important;
          page-break-inside: auto !important;
        }
        
        li {
          margin-bottom: 6px !important;
          line-height: 1.5 !important;
          page-break-inside: avoid !important;
          orphans: 2 !important;
          widows: 2 !important;
        }
        
        /* Competency section - Allow page breaks but keep chart intact */
        .competency-chart-container {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          margin: 20px 0 !important;
          padding: 25px !important;
          background: white !important;
          border: 1px solid #e1e4e8 !important;
          border-radius: 8px !important;
        }
        
        /* Competency grid - Allow breaking between items */
        .print-section .grid {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 12px !important;
          margin-top: 15px !important;
          page-break-inside: auto !important;
        }
        
        .print-section .grid > div {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        /* Risk sections - Allow breaking */
        .border-red-200, .border-blue-200 {
          border-color: #d1d5db !important;
          page-break-inside: auto !important;
        }
        
        .bg-red-50, .bg-blue-50 {
          background: #f3f4f6 !important;
        }
        
        .border-red-500, .border-blue-500 {
          border-left-color: #6b7280 !important;
        }
        
        .text-red-600, .text-blue-600 {
          color: #374151 !important;
        }
        
        /* Responsibilities categories - Allow breaking between categories */
        .print-section .space-y-4 {
          page-break-inside: auto !important;
        }
        
        .print-section .space-y-4 > div {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          margin-bottom: 12px !important;
          orphans: 2 !important;
          widows: 2 !important;
        }
        
        /* Typography refinements */
        h4 {
          font-size: 11pt !important;
          font-weight: 600 !important;
          color: #1a1a1a !important;
          margin-bottom: 8px !important;
          page-break-after: avoid !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
        }
        
        h4 svg {
          width: 14px !important;
          height: 14px !important;
          opacity: 0.7 !important;
        }
        
        p {
          font-size: 10pt !important;
          line-height: 1.6 !important;
          orphans: 2 !important;
          widows: 2 !important;
        }
        
        /* Icons - Subtle in print */
        svg {
          opacity: 0.7 !important;
        }
        
        /* Ensure consistent font sizes */
        .text-sm {
          font-size: 9pt !important;
        }
        
        .text-xs {
          font-size: 8pt !important;
        }
        
        /* Professional spacing for info items */
        .space-y-2 > div {
          margin-bottom: 8px !important;
        }
        
        /* Clean borders */
        .rounded-lg, .rounded-2xl {
          border-radius: 6px !important;
        }
        
        /* Prevent content clipping */
        * {
          overflow: visible !important;
        }
        
        /* Ensure all content is visible */
        .overflow-hidden {
          overflow: visible !important;
        }
        
        /* Risk list items */
        .rounded-lg.overflow-hidden {
          overflow: visible !important;
        }
        
        .rounded-lg.overflow-hidden ul {
          page-break-inside: auto !important;
        }
        
        /* Better orphan/widow control */
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
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

  const getAssetName = (assetId: string) => {
    // Check if it's a predefined asset ID
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      return asset.name;
    }
    // Otherwise, it's a custom asset name
    return assetId;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'strategic': <Lightbulb className="w-4 h-4" />,
      'team_management': <UsersRound className="w-4 h-4" />,
      'general': <Briefcase className="w-4 h-4" />,
      'culture': <Palette className="w-4 h-4" />,
      'efficiency': <Zap className="w-4 h-4" />,
      'other': <MoreHorizontal className="w-4 h-4" />,
    };
    return iconMap[category] || <Briefcase className="w-4 h-4" />;
  };

  const getCompetencyIcon = (competencyName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Execution': <TrendingUp className="w-4 h-4" />,
      'Communication': <MessageSquare className="w-4 h-4" />,
      'Self Awareness': <Eye className="w-4 h-4" />,
      'Leadership': <Compass className="w-4 h-4" />,
      'Business Mind': <Brain className="w-4 h-4" />,
      'Long-term Thinking': <Lightbulb className="w-4 h-4" />,
    };
    return iconMap[competencyName] || <Award className="w-4 h-4" />;
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
        <div className="bg-gradient-to-r from-accent-500 to-accent-600 px-8 py-6 text-white print-header">
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
            <div className="text-right flex flex-col items-end gap-2 print:hidden">
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

        <div className="p-8 space-y-8 print-content">
          {/* Basic Information */}
          <div className="print-section">
            <h3 className="text-lg font-semibold text-primary-600 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="bg-primary-50/50 rounded-lg p-4">
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

          {/* Company Assets */}
          {jd.company_assets && jd.company_assets.length > 0 && (
            <div className="print-section">
              <h3 className="text-lg font-semibold text-primary-600 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Company Assets (ทรัพย์สินบริษัท)
              </h3>
              <div className="bg-primary-50/50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {jd.company_assets.map((assetId: string, index: number) => (
                    <div key={index} className="flex items-center p-2 bg-white rounded border border-primary-200">
                      <span className="text-primary-400 mr-2">✓</span>
                      <span className="text-sm text-primary-700">{getAssetName(assetId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Job Purpose */}
          <div className="print-section">
            <h3 className="text-lg font-semibold text-primary-600 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Job Purpose (วัตถุประสงค์ของงาน)
            </h3>
            <div className="bg-primary-50/50 rounded-lg p-4">
              <p className="text-primary-700 leading-relaxed">{jd.job_purpose}</p>
            </div>
          </div>

          {/* Responsibilities */}
          {jd.responsibilities && jd.responsibilities.length > 0 && (
            <div className="print-section">
              <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Responsibilities (หน้าที่ความรับผิดชอบ)
              </h3>
              <div className="space-y-4">
                {Object.entries(
                  jd.responsibilities.reduce((acc, resp) => {
                    if (!acc[resp.category]) acc[resp.category] = [];
                    acc[resp.category].push(resp);
                    return acc;
                  }, {} as Record<string, typeof jd.responsibilities>)
                ).map(([category, items]) => {
                  // Map category names to Thai labels
                  const categoryLabels: Record<string, string> = {
                    'strategic': 'Strategic (เชิงกลยุทธ์)',
                    'team_management': 'Team Management & Development',
                    'general': 'General (งานทั่วไป)',
                    'culture': 'Culture (วัฒนธรรม)',
                    'efficiency': 'Efficiency (ประสิทธิภาพ)',
                    'other': 'Other (อื่นๆ)'
                  };
                  
                  return (
                    <div key={category} className="bg-primary-50/50 rounded-lg p-4">
                      <h4 className="font-medium text-primary-600 mb-2 flex items-center gap-2">
                        {getCategoryIcon(category)}
                        {categoryLabels[category] || category.replace('_', ' ')}
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
                  );
                })}
              </div>
            </div>
          )}

          {/* Competencies */}
          {jd.competencies && jd.competencies.length > 0 && (
            <div className="print-section">
              <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Core Competencies (สมรรถนะหลัก)
              </h3>
              
              {/* Spider Chart */}
              <div className="bg-white rounded-lg p-6 mb-6 border border-primary-100 competency-chart-container">
                <CompetencyRadarChart competencies={jd.competencies} />
              </div>

              {/* Competency Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jd.competencies.map((comp, index) => {
                  const compName = getCompetencyName(comp.competency_id);
                  return (
                    <div key={index} className="bg-primary-50/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-primary-600 flex items-center gap-2">
                          {getCompetencyIcon(compName)}
                          {compName}
                        </h4>
                        <span className={`font-bold ${getScoreColor(comp.score)}`}>
                          {comp.score}/5
                        </span>
                      </div>
                      {comp.notes && (
                        <p className="text-sm text-primary-500">{comp.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Risks */}
          {jd.risks && jd.risks.length > 0 && (
            <div className="print-section">
              <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Factors (ความเสี่ยง)
              </h3>
              <div className="space-y-4">
                {/* External Risks */}
                {jd.risks.filter(r => r.type === 'external').length > 0 && (
                  <div className="rounded-lg overflow-hidden border border-red-200">
                    <div className="bg-red-50 px-4 py-2 border-l-4 border-red-500">
                      <h4 className="font-semibold text-red-600 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        External Risks (ความเสี่ยงภายนอก)
                      </h4>
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
                      <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Internal Risks (ความเสี่ยงภายใน)
                      </h4>
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