import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  FileText,
  Calendar,
  MapPin,
  Building2,
  Users,
  User,
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
import { CompetencyRadarChart } from '../../components/CompetencyRadarChart';
import type { JobDescriptionAPI } from '../../types';

export const PublicViewJDPage = () => {
  const { id } = useParams<{ id: string }>();
  const [jd, setJd] = useState<JobDescriptionAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Load main JD data
      const { data: jdData, error: jdError } = await supabase
        .from('job_descriptions')
        .select('*')
        .eq('id', id)
        .single();

      if (jdError) throw jdError;

      // Load related data in parallel
      const [
        { data: responsibilities },
        { data: risks },
        { data: competenciesData },
        { data: locationsData },
        { data: departmentsData },
        { data: teamsData },
        { data: allCompetencies },
        { data: assetsData }
      ] = await Promise.all([
        supabase.from('jd_responsibilities').select('*').eq('jd_id', id).order('order_index'),
        supabase.from('jd_risks').select('*').eq('jd_id', id).order('order_index'),
        supabase.from('jd_competencies').select('*, competency:competencies(id, name)').eq('jd_id', id),
        supabase.from('locations').select('*'),
        supabase.from('departments').select('*'),
        supabase.from('teams').select('*'),
        supabase.from('competencies').select('*').order('name'),
        supabase.from('company_assets').select('*').order('name'),
      ]);

      if (jdData) {
        // Attach related data to JD
        setJd({
          ...jdData,
          responsibilities: responsibilities || [],
          risks: risks || [],
          competencies: competenciesData || [],
        });
      }
      
      if (locationsData) setLocations(locationsData);
      if (departmentsData) setDepartments(departmentsData);
      if (teamsData) setTeams(teamsData);
      if (allCompetencies) setCompetencies(allCompetencies);
      if (assetsData) setAssets(assetsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
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


  const getAssetIcon = (assetName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'คอมพิวเตอร์โน้ตบุ๊ค': <Laptop className="w-4 h-4" />,
      'Laptop': <Laptop className="w-4 h-4" />,
      'เครื่องโทรศัพท์': <Smartphone className="w-4 h-4" />,
      'Mobile Phone': <Smartphone className="w-4 h-4" />,
      'เมอร์โทรศัพท์': <Phone className="w-4 h-4" />,
      'ค่าโทรศัพท์': <Phone className="w-4 h-4" />,
      'รถยนต์': <Car className="w-4 h-4" />,
      'Fleet Card': <CreditCard className="w-4 h-4" />,
      'บัตรรองรถ': <Fuel className="w-4 h-4" />,
      'บัตร Easy Pass': <Ticket className="w-4 h-4" />,
      'เครื่อง Ipad': <Tablet className="w-4 h-4" />,
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  if (!jd) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-primary-300 mx-auto mb-4" />
          <p className="text-body text-primary-400">Job description not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Job Description Content */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 shadow-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-accent-500 to-accent-600 px-8 py-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Left Section */}
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold mb-3 lg:mb-4">{jd.position}</h1>
                <div className="flex flex-wrap items-center gap-2 text-accent-50 text-sm">
                  <span className="font-medium whitespace-nowrap">{jd.job_band} • {jd.job_grade}</span>
                  <span className="text-accent-200">|</span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Building2 className="w-4 h-4" />
                    {getDepartmentName(jd.department_id)}
                  </span>
                  <span className="text-accent-200">|</span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <MapPin className="w-4 h-4" />
                    {getLocationName(jd.location_id)}
                  </span>
                  <span className="text-accent-200">|</span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Team:</span>
                    {getTeamName(jd.team_id)}
                  </span>
                  {jd.direct_supervisor && (
                    <>
                      <span className="text-accent-200">|</span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Supervisor:</span>
                        {jd.direct_supervisor}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right Section */}
              <div className="flex flex-col items-start lg:items-end gap-2 text-accent-50 text-sm">
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Published:</span>
                  {formatDate(jd.created_at)}
                </span>
                <span className="flex items-center gap-2 text-accent-100 whitespace-nowrap">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Last updated:</span>
                  {formatDate(jd.updated_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Job Purpose */}
            <div>
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
              <div>
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
            <div>
              <h3 className="text-lg font-semibold text-pink-600 mb-4 flex items-center gap-2 border-b-2 border-pink-200 pb-2">
                <Award className="w-5 h-5" />
                Core Competencies (สมรรถนะหลัก)
              </h3>
              
              {/* Spider Chart */}
              <div className="bg-white rounded-lg p-6 mb-6 border border-primary-100">
                <CompetencyRadarChart 
                  competencies={jd.competencies || []} 
                  allCompetencies={competencies}
                />
              </div>

              {/* Competency Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competencies.map((competency) => {
                  const compData = jd.competencies?.find(c => c.competency_id === competency.id);
                  const score = compData?.score || 0;
                  const notes = compData?.notes || '';
                  const compName = competency.name;
                  
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
              <div>
                <h3 className="text-lg font-semibold text-amber-600 mb-4 flex items-center gap-2 border-b-2 border-amber-200 pb-2">
                  <AlertTriangle className="w-5 h-5" />
                  Risk Factors (ความเสี่ยง)
                </h3>
                <div className="space-y-4">
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
              <div>
                <h3 className="text-lg font-semibold text-purple-600 mb-3 flex items-center gap-2 border-b-2 border-purple-200 pb-2">
                  <Package className="w-5 h-5" />
                  Company Assets (ทรัพย์สินบริษัท)
                </h3>
                <div className="bg-primary-50/50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {jd.company_assets
                      .map((assetId: string) => {
                        // Find asset by ID or name
                        const asset = assets.find(a => a.id === assetId || a.name === assetId);
                        return asset ? asset.name : null;
                      })
                      .filter((name): name is string => name !== null)
                      .map((assetName: string, index: number) => (
                        <div key={index} className="flex items-center p-2 bg-white rounded border border-purple-200">
                          <span className="text-purple-500 mr-2">{getAssetIcon(assetName)}</span>
                          <span className="text-sm text-primary-700">{assetName}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-primary-400">
          <p>Job Description Management System</p>
        </div>
      </div>
    </div>
  );
};
