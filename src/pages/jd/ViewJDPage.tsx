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
  Clock,
  Laptop,
  Smartphone,
  CreditCard,
  Car,
  Ticket,
  Tablet,
  Phone,
  Fuel,
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
        
        /* Force page break before specific sections */
        .page-break-before {
          page-break-before: always !important;
          break-before: page !important;
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        
        .print-section h3 {
          font-size: 14pt !important;
          font-weight: 600 !important;
          margin-top: 0 !important;
          margin-bottom: 12px !important;
          padding-bottom: 8px !important;
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
          orphans: 2 !important;
          widows: 2 !important;
        }
        
        /* Risk sections - Preserve colors and allow breaking */
        .border-red-200 {
          border-color: #fecaca !important;
          page-break-inside: auto !important;
        }
        
        .border-blue-200 {
          border-color: #bfdbfe !important;
          page-break-inside: auto !important;
        }
        
        .bg-red-50 {
          background: #fef2f2 !important;
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }
        
        .bg-blue-50 {
          background: #eff6ff !important;
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }
        
        .border-red-500 {
          border-left-color: #ef4444 !important;
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }
        
        .border-blue-500 {
          border-left-color: #3b82f6 !important;
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }
        
        .text-red-600 {
          color: #dc2626 !important;
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }
        
        .text-blue-600 {
          color: #2563eb !important;
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }
        
        .text-red-400 {
          color: #f87171 !important;
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }
        
        .text-blue-400 {
          color: #60a5fa !important;
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
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


  const getAssetName = (assetId: string) => {
    // Check if it's a predefined asset ID
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      return asset.name;
    }
    // Otherwise, it's a custom asset name
    return assetId;
  };

  const getAssetIcon = (assetName: string) => {
    console.log('Asset name:', assetName); // Debug log
    const iconMap: Record<string, React.ReactNode> = {
      // คอมพิวเตอร์โน้ตบุ๊ค
      'คอมพิวเตอร์โน้ตบุ๊ค': <Laptop className="w-4 h-4" />,
      'Laptop': <Laptop className="w-4 h-4" />,
      
      // เครื่องโทรศัพท์
      'เครื่องโทรศัพท์': <Smartphone className="w-4 h-4" />,
      'Mobile Phone': <Smartphone className="w-4 h-4" />,
      
      // เมอร์โทรศัพท์
      'เมอร์โทรศัพท์': <Phone className="w-4 h-4" />,
      
      // ค่าโทรศัพท์
      'ค่าโทรศัพท์': <Phone className="w-4 h-4" />,
      
      // รถยนต์
      'รถยนต์': <Car className="w-4 h-4" />,
      
      // Fleet Card
      'Fleet Card': <CreditCard className="w-4 h-4" />,
      
      // บัตรรองรถ
      'บัตรรองรถ': <Fuel className="w-4 h-4" />,
      
      // บัตร Easy Pass
      'บัตร Easy Pass': <Ticket className="w-4 h-4" />,
      
      // เครื่อง Ipad
      'เครื่อง Ipad': <Tablet className="w-4 h-4" />,
      
      // Access Card / บัตรประจำตัว
      'Access Card': <CreditCard className="w-4 h-4" />,
      'บัตรประจำตัว': <CreditCard className="w-4 h-4" />,
    };
    return iconMap[assetName] || <Package className="w-4 h-4" />;
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
        <div className="bg-gradient-to-r from-accent-500 to-accent-600 px-8 py-8 text-white print-header">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left Section */}
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-3 lg:mb-4">{jd.position}</h1>
              <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-accent-50 text-sm lg:text-base">
                <span className="font-medium">{jd.job_band} • {jd.job_grade}</span>
                <span className="text-accent-200">|</span>
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 lg:w-5 lg:h-5" />
                  {getDepartmentName(jd.department_id)}
                </span>
                <span className="text-accent-200">|</span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 lg:w-5 lg:h-5" />
                  {getLocationName(jd.location_id)}
                </span>
                <span className="text-accent-200">|</span>
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="font-medium">Team:</span>
                  {getTeamName(jd.team_id)}
                </span>
                {jd.direct_supervisor && (
                  <>
                    <span className="text-accent-200">|</span>
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 lg:w-5 lg:h-5" />
                      <span className="font-medium">Supervisor:</span>
                      {jd.direct_supervisor}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex flex-col items-start lg:items-end gap-3">
              {/* Action Buttons */}
              <div className="flex items-center gap-2 print:hidden">
                {getStatusBadge(jd.status)}
                {canEdit && (
                  <Link to={`/jd/${jd.id}/edit`}>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  </Link>
                )}
              </div>

              {/* Info - Published and Updated */}
              <div className="flex flex-col lg:items-end gap-2 text-accent-50 text-sm lg:text-base">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="font-medium">Published:</span>
                  {formatDate(jd.created_at)}
                </span>
                <span className="flex items-center gap-2 text-accent-100">
                  <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="font-medium">Last updated:</span>
                  {formatDate(jd.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8 print-content">
          {/* Job Purpose */}
          <div className="print-section">
            <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2 border-b-2 border-green-200 pb-2">
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
              <h3 className="text-lg font-semibold text-orange-600 mb-4 flex items-center gap-2 border-b-2 border-orange-200 pb-2">
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
                  // Map category names to Thai labels and colors
                  const categoryLabels: Record<string, string> = {
                    'strategic': 'Strategic (เชิงกลยุทธ์)',
                    'team_management': 'Team Management & Development',
                    'general': 'General (งานทั่วไป)',
                    'culture': 'Culture (วัฒนธรรม)',
                    'efficiency': 'Efficiency (ประสิทธิภาพ)',
                    'other': 'Other (อื่นๆ)'
                  };
                  
                  const categoryColors: Record<string, string> = {
                    'strategic': 'text-indigo-600',
                    'team_management': 'text-cyan-600',
                    'general': 'text-amber-600',
                    'culture': 'text-rose-600',
                    'efficiency': 'text-emerald-600',
                    'other': 'text-violet-600'
                  };
                  
                  return (
                    <div key={category} className="bg-primary-50/50 rounded-lg p-4">
                      <h4 className={`font-medium mb-2 flex items-center gap-2 ${categoryColors[category] || 'text-primary-600'}`}>
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
          <div className="print-section page-break-before">
            <h3 className="text-lg font-semibold text-pink-600 mb-4 flex items-center gap-2 border-b-2 border-pink-200 pb-2">
              <Award className="w-5 h-5" />
              Core Competencies (สมรรถนะหลัก)
            </h3>
            
            {/* Spider Chart */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-primary-100 competency-chart-container">
              <CompetencyRadarChart 
                competencies={jd.competencies || []} 
                allCompetencies={competencies}
              />
            </div>

            {/* Competency Details - Show all 6 competencies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competencies.map((competency) => {
                // Find the score for this competency
                const compData = jd.competencies?.find(c => c.competency_id === competency.id);
                const score = compData?.score || 0;
                const notes = compData?.notes || '';
                const compName = competency.name;
                
                // Assign colors to each competency
                const competencyColors: Record<string, string> = {
                  'Execution': 'text-blue-600',
                  'Communication': 'text-purple-600',
                  'Self Awareness': 'text-teal-600',
                  'Leadership': 'text-orange-600',
                  'Business Mind': 'text-indigo-600',
                  'Long-term Thinking': 'text-pink-600',
                };
                
                return (
                  <div key={competency.id} className="bg-primary-50/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-medium flex items-center gap-2 ${competencyColors[compName] || 'text-primary-600'}`}>
                        {getCompetencyIcon(compName)}
                        {compName}
                      </h4>
                      <span className={`font-bold ${getScoreColor(score)}`}>
                        {score}/5
                      </span>
                    </div>
                    {notes && (
                      <p className="text-sm text-primary-500">{notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risks */}
          {jd.risks && jd.risks.length > 0 && (
            <div className="print-section">
              <h3 className="text-lg font-semibold text-amber-600 mb-4 flex items-center gap-2 border-b-2 border-amber-200 pb-2">
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

          {/* Company Assets */}
          {jd.company_assets && jd.company_assets.length > 0 && (
            <div className="print-section">
              <h3 className="text-lg font-semibold text-purple-600 mb-3 flex items-center gap-2 border-b-2 border-purple-200 pb-2">
                <Package className="w-5 h-5" />
                Company Assets (ทรัพย์สินบริษัท)
              </h3>
              <div className="bg-primary-50/50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {jd.company_assets.map((assetId: string, index: number) => {
                    const assetName = getAssetName(assetId);
                    return (
                      <div key={index} className="flex items-center p-2 bg-white rounded border border-purple-200">
                        <span className="text-purple-500 mr-2">{getAssetIcon(assetName)}</span>
                        <span className="text-sm text-primary-700">{assetName}</span>
                      </div>
                    );
                  })}
                </div>
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