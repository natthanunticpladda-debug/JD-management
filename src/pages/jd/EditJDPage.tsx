import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useJobDescriptions } from '../../hooks/useJobDescriptions';
import { useLocations } from '../../hooks/useLocations';
import { useDepartments } from '../../hooks/useDepartments';
import { useTeams } from '../../hooks/useTeams';
import { useCompetencies } from '../../hooks/useCompetencies';
import { useJobBands } from '../../hooks/useJobBands';
import { useJobGrades } from '../../hooks/useJobGrades';
import { useCompanyAssets } from '../../hooks/useCompanyAssets';
import { Button } from '../../components/ui/Button';
import { PositionAutocomplete } from '../../components/ui/PositionAutocomplete';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Slider } from '../../components/ui/Slider';
import { Plus, Trash2, Save, ArrowLeft, Printer, Target, ClipboardList, Package, Award, AlertTriangle, Globe, Home } from 'lucide-react';
import { SpiderChart } from '../../components/ui/SpiderChart';
import type {
  JobBand,
  JobGrade,
} from '../../types';
import toast from 'react-hot-toast';

interface ResponsibilityItem {
  description: string;
}

interface Risk {
  type: 'external' | 'internal';
  description: string;
}

interface CompetencyScore {
  competencyId: string;
  score: number;
  notes: string;
}

export const EditJDPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  console.log('=== EditJDPage Component Rendered ===');
  console.log('ID from useParams:', id);

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/job-descriptions');
    }
  };
  
  const { user } = useAuth();
  const { getJobDescription, updateJobDescription } = useJobDescriptions();
  const { locations } = useLocations();
  const { departments } = useDepartments();
  const { teams } = useTeams();
  const { competencies } = useCompetencies();
  const { jobBands } = useJobBands();
  const { jobGrades } = useJobGrades();
  const { assets } = useCompanyAssets();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loadedJD, setLoadedJD] = useState<any>(null); // Store loaded JD data

  // Basic Information
  const [position, setPosition] = useState('');
  const [directSupervisor, setDirectSupervisor] = useState('');
  const [jobBand, setJobBand] = useState<JobBand | ''>('');
  const [jobGrade, setJobGrade] = useState<JobGrade | ''>('');
  const [locationId, setLocationId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [teamId, setTeamId] = useState('');

  // Job Purpose
  const [jobPurpose, setJobPurpose] = useState('');

  // Company Assets
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [customAssets, setCustomAssets] = useState<string[]>([]); // Custom assets added by user

  // Responsibilities by category
  const [strategicResponsibilities, setStrategicResponsibilities] = useState<ResponsibilityItem[]>([]);
  const [teamManagementResponsibilities, setTeamManagementResponsibilities] = useState<ResponsibilityItem[]>([]);
  const [generalResponsibilities, setGeneralResponsibilities] = useState<ResponsibilityItem[]>([]);
  const [cultureResponsibilities, setCultureResponsibilities] = useState<ResponsibilityItem[]>([]);
  const [efficiencyResponsibilities, setEfficiencyResponsibilities] = useState<ResponsibilityItem[]>([]);
  const [otherResponsibilities, setOtherResponsibilities] = useState<ResponsibilityItem[]>([]);

  // Responsibility percentages (must sum to 100)
  const [responsibilityPercentages, setResponsibilityPercentages] = useState({
    strategic: 0,
    team_management: 0,
    general: 0,
    culture: 0,
    efficiency: 0,
    other: 0,
  });

  const totalPercentage = Object.values(responsibilityPercentages).reduce((sum, val) => sum + val, 0);

  const updatePercentage = (category: keyof typeof responsibilityPercentages, value: number) => {
    const numValue = Math.max(0, value || 0);
    const currentValue = responsibilityPercentages[category];
    const otherTotal = totalPercentage - currentValue;
    const maxAllowed = 100 - otherTotal;
    const finalValue = Math.min(numValue, maxAllowed);
    setResponsibilityPercentages(prev => ({ ...prev, [category]: finalValue }));
  };

  // Risks
  const [externalRisks, setExternalRisks] = useState<Risk[]>([{ type: 'external', description: '' }]);
  const [internalRisks, setInternalRisks] = useState<Risk[]>([{ type: 'internal', description: '' }]);

  // Competencies
  const [competencyScores, setCompetencyScores] = useState<CompetencyScore[]>([]);

  // Load job description data
  useEffect(() => {
    console.log('=== EditJDPage useEffect triggered ===');
    console.log('ID from params:', id);
    if (id) {
      console.log('Calling loadJobDescription...');
      loadJobDescription();
    } else {
      console.log('No ID found in params!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Populate competency scores when both JD data and competencies are loaded
  useEffect(() => {
    if (loadedJD && loadedJD.competencies && competencies.length > 0 && competencyScores.length === 0) {
      const scores = competencies.map(comp => {
        const existing = loadedJD.competencies?.find((c: any) => c.competency_id === comp.id);
        return {
          competencyId: comp.id,
          score: existing?.score || 0,
          notes: existing?.notes || '',
        };
      });
      setCompetencyScores(scores);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedJD, competencies.length]);

  // Populate company assets when both JD data and assets are loaded
  useEffect(() => {
    if (loadedJD && loadedJD.company_assets && loadedJD.company_assets.length > 0 && assets.length > 0) {
      console.log('=== Loading company assets ===');
      console.log('JD company_assets:', loadedJD.company_assets);
      console.log('Available assets:', assets);
      
      const predefinedAssetIds = assets.map(a => a.id);
      const predefinedAssetNames = assets.map(a => a.name);
      const predefined: string[] = [];
      const custom: string[] = [];
      
      loadedJD.company_assets.forEach((assetValue: string) => {
        // Check if it's a predefined asset by ID
        if (predefinedAssetIds.includes(assetValue)) {
          predefined.push(assetValue);
        } 
        // Check if it's a predefined asset by name
        else if (predefinedAssetNames.includes(assetValue)) {
          // Find the asset ID by name
          const asset = assets.find(a => a.name === assetValue);
          if (asset) {
            predefined.push(asset.id);
          }
        }
        // Otherwise it's a custom asset
        else {
          custom.push(assetValue);
        }
      });
      
      console.log('Predefined assets to select:', predefined);
      console.log('Custom assets:', custom);
      
      setSelectedAssets(predefined);
      setCustomAssets(custom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedJD, assets.length]);

  // Initialize competency scores when competencies are loaded (only for new JD)
  useEffect(() => {
    if (competencies.length > 0 && competencyScores.length === 0 && !loading && !loadedJD) {
      setCompetencyScores(
        competencies.map((comp) => ({ competencyId: comp.id, score: 0, notes: '' }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competencies.length, loading]);

  // Add print styles for proper color rendering
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        
        /* Risk section colors */
        .border-red-200 {
          border-color: #fecaca !important;
        }
        
        .border-blue-200 {
          border-color: #bfdbfe !important;
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
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const loadJobDescription = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getJobDescription(id);
      console.log('Loaded JD data:', data);
      if (!data) return;
      
      // Store loaded data for later use
      setLoadedJD(data);
      
      // Populate basic information
      setPosition(data.position || '');
      setDirectSupervisor(data.direct_supervisor || '');
      setJobBand(data.job_band || '');
      setJobGrade(data.job_grade || '');
      setLocationId(data.location_id || '');
      setDepartmentId(data.department_id || '');
      setTeamId(data.team_id || '');
      setJobPurpose(data.job_purpose || '');
      setStatus((data.status === 'draft' || data.status === 'published' ? data.status : 'draft') || 'draft');
      
      // Load company assets
      if (data.company_assets && data.company_assets.length > 0) {
        console.log('Loading company assets:', data.company_assets);
        console.log('Available assets:', assets);
        
        const predefinedAssetIds = assets.map(a => a.id);
        const predefinedAssetNames = assets.map(a => a.name);
        const predefined: string[] = [];
        const custom: string[] = [];
        
        data.company_assets.forEach((assetValue: string) => {
          // Check if it's a predefined asset by ID
          if (predefinedAssetIds.includes(assetValue)) {
            predefined.push(assetValue);
          } 
          // Check if it's a predefined asset by name
          else if (predefinedAssetNames.includes(assetValue)) {
            // Find the asset ID by name
            const asset = assets.find(a => a.name === assetValue);
            if (asset) {
              predefined.push(asset.id);
            }
          }
          // Otherwise it's a custom asset
          else {
            custom.push(assetValue);
          }
        });
        
        console.log('Predefined assets to select:', predefined);
        console.log('Custom assets:', custom);
        
        setSelectedAssets(predefined);
        setCustomAssets(custom);
      }
      
      console.log('Set basic info - Position:', data.position, 'Job Band:', data.job_band);
      
      // Populate responsibilities by category
      if (data.responsibilities && data.responsibilities.length > 0) {
        console.log('Loading responsibilities:', data.responsibilities.length);
        const strategic = data.responsibilities
          .filter(r => r.category === 'strategic')
          .map(r => ({ description: r.description }));
        const teamMgmt = data.responsibilities
          .filter(r => r.category === 'team_management')
          .map(r => ({ description: r.description }));
        const general = data.responsibilities
          .filter(r => r.category === 'general')
          .map(r => ({ description: r.description }));
        const culture = data.responsibilities
          .filter(r => r.category === 'culture')
          .map(r => ({ description: r.description }));
        const efficiency = data.responsibilities
          .filter(r => r.category === 'efficiency')
          .map(r => ({ description: r.description }));
        const other = data.responsibilities
          .filter(r => r.category === 'other')
          .map(r => ({ description: r.description }));
        
        setStrategicResponsibilities(strategic);
        setTeamManagementResponsibilities(teamMgmt);
        setGeneralResponsibilities(general);
        setCultureResponsibilities(culture);
        setEfficiencyResponsibilities(efficiency);
        setOtherResponsibilities(other);
      }
      
      // Load responsibility percentages
      if (data.responsibility_percentages) {
        console.log('Loading responsibility percentages:', data.responsibility_percentages);
        setResponsibilityPercentages({
          strategic: data.responsibility_percentages.strategic || 0,
          team_management: data.responsibility_percentages.team_management || 0,
          general: data.responsibility_percentages.general || 0,
          culture: data.responsibility_percentages.culture || 0,
          efficiency: data.responsibility_percentages.efficiency || 0,
          other: data.responsibility_percentages.other || 0,
        });
      }
      
      // Populate risks
      if (data.risks && data.risks.length > 0) {
        console.log('Loading risks:', data.risks.length);
        const external = data.risks
          .filter(r => r.type === 'external')
          .map(r => ({ type: 'external' as const, description: r.description }));
        const internal = data.risks
          .filter(r => r.type === 'internal')
          .map(r => ({ type: 'internal' as const, description: r.description }));
        
        setExternalRisks(external.length > 0 ? external : [{ type: 'external', description: '' }]);
        setInternalRisks(internal.length > 0 ? internal : [{ type: 'internal', description: '' }]);
      }
      
      // Competency scores will be populated by useEffect when competencies are loaded
      console.log('Competencies in data:', data.competencies?.length || 0);
      
    } catch (error) {
      console.error('Error loading JD:', error);
      toast.error('Failed to load job description');
      navigate('/job-descriptions');
    } finally {
      setLoading(false);
    }
  };

  // Get filtered teams based on department
  const filteredTeams = teams.filter((t) => t.department_id === departmentId);

  // Get available job grades based on job band
  const getAvailableGrades = (): JobGrade[] => {
    if (!jobBand) return [];
    const selectedBand = jobBands.find(b => b.name === jobBand);
    if (!selectedBand) return [];
    return jobGrades
      .filter(g => g.job_band_id === selectedBand.id)
      .map(g => g.name as JobGrade);
  };

  // Responsibility handlers
  const addResponsibility = (category: string) => {
    const newItem = { description: '' };
    switch (category) {
      case 'strategic':
        setStrategicResponsibilities([...strategicResponsibilities, newItem]);
        break;
      case 'team_management':
        setTeamManagementResponsibilities([...teamManagementResponsibilities, newItem]);
        break;
      case 'general':
        setGeneralResponsibilities([...generalResponsibilities, newItem]);
        break;
      case 'culture':
        setCultureResponsibilities([...cultureResponsibilities, newItem]);
        break;
      case 'efficiency':
        setEfficiencyResponsibilities([...efficiencyResponsibilities, newItem]);
        break;
      case 'other':
        setOtherResponsibilities([...otherResponsibilities, newItem]);
        break;
    }
  };

  // Handle Enter key press to add new item
  const handleKeyPress = (e: React.KeyboardEvent, category: string, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addResponsibility(category);
      // Focus on the new input after a short delay
      setTimeout(() => {
        const inputs = document.querySelectorAll(`input[data-category="${category}"]`);
        const nextInput = inputs[index + 1] as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 50);
    }
  };

  const updateResponsibility = (category: string, index: number, value: string) => {
    switch (category) {
      case 'strategic': {
        const updated = [...strategicResponsibilities];
        updated[index] = { description: value };
        setStrategicResponsibilities(updated);
        break;
      }
      case 'team_management': {
        const updated = [...teamManagementResponsibilities];
        updated[index] = { description: value };
        setTeamManagementResponsibilities(updated);
        break;
      }
      case 'general': {
        const updated = [...generalResponsibilities];
        updated[index] = { description: value };
        setGeneralResponsibilities(updated);
        break;
      }
      case 'culture': {
        const updated = [...cultureResponsibilities];
        updated[index] = { description: value };
        setCultureResponsibilities(updated);
        break;
      }
      case 'efficiency': {
        const updated = [...efficiencyResponsibilities];
        updated[index] = { description: value };
        setEfficiencyResponsibilities(updated);
        break;
      }
      case 'other': {
        const updated = [...otherResponsibilities];
        updated[index] = { description: value };
        setOtherResponsibilities(updated);
        break;
      }
    }
  };

  const removeResponsibility = (category: string, index: number) => {
    switch (category) {
      case 'strategic':
        setStrategicResponsibilities(strategicResponsibilities.filter((_, i) => i !== index));
        break;
      case 'team_management':
        setTeamManagementResponsibilities(teamManagementResponsibilities.filter((_, i) => i !== index));
        break;
      case 'general':
        setGeneralResponsibilities(generalResponsibilities.filter((_, i) => i !== index));
        break;
      case 'culture':
        setCultureResponsibilities(cultureResponsibilities.filter((_, i) => i !== index));
        break;
      case 'efficiency':
        setEfficiencyResponsibilities(efficiencyResponsibilities.filter((_, i) => i !== index));
        break;
      case 'other':
        setOtherResponsibilities(otherResponsibilities.filter((_, i) => i !== index));
        break;
    }
  };

  // Risk handlers
  const updateExternalRisk = (index: number, value: string) => {
    const updated = [...externalRisks];
    updated[index] = { ...updated[index], description: value };
    setExternalRisks(updated);
  };

  const removeExternalRisk = (index: number) => {
    setExternalRisks(externalRisks.filter((_, i) => i !== index));
  };

  const updateInternalRisk = (index: number, value: string) => {
    const updated = [...internalRisks];
    updated[index] = { ...updated[index], description: value };
    setInternalRisks(updated);
  };

  const removeInternalRisk = (index: number) => {
    setInternalRisks(internalRisks.filter((_, i) => i !== index));
  };

  // Handle Enter key press for risks
  const handleRiskKeyPress = (e: React.KeyboardEvent, type: 'external' | 'internal', index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'external') {
        setExternalRisks([...externalRisks, { type: 'external', description: '' }]);
        setTimeout(() => {
          const inputs = document.querySelectorAll(`input[data-risk-type="external"]`);
          const nextInput = inputs[index + 1] as HTMLInputElement;
          if (nextInput) {
            nextInput.focus();
          }
        }, 50);
      } else {
        setInternalRisks([...internalRisks, { type: 'internal', description: '' }]);
        setTimeout(() => {
          const inputs = document.querySelectorAll(`input[data-risk-type="internal"]`);
          const nextInput = inputs[index + 1] as HTMLInputElement;
          if (nextInput) {
            nextInput.focus();
          }
        }, 50);
      }
    }
  };

  // Competency handlers
  const updateCompetencyScore = (competencyId: string, field: 'score' | 'notes', value: number | string) => {
    setCompetencyScores(
      competencyScores.map((cs) =>
        cs.competencyId === competencyId ? { ...cs, [field]: value } : cs
      )
    );
  };

  // Handle print function
  const handlePrint = () => {
    window.print();
  };

  // Get spider chart data
  const getSpiderChartData = () => {
    return competencies.map(comp => {
      const compScore = competencyScores.find(cs => cs.competencyId === comp.id);
      return {
        name: comp.name,
        score: compScore?.score || 0,
        fullMark: 5,
      };
    }).filter(item => item.score > 0);
  };

  const validateForm = () => {
    if (!position.trim()) {
      toast.error('กรุณากรอกตำแหน่งงาน');
      return false;
    }
    if (!jobBand) {
      toast.error('กรุณาเลือก Job Band');
      return false;
    }
    if (!jobGrade) {
      toast.error('กรุณาเลือก Job Grade');
      return false;
    }
    if (!locationId) {
      toast.error('กรุณาเลือกสถานที่');
      return false;
    }
    if (!departmentId) {
      toast.error('กรุณาเลือกแผนก');
      return false;
    }
    if (!teamId) {
      toast.error('กรุณาเลือกทีม');
      return false;
    }
    if (!jobPurpose.trim()) {
      toast.error('กรุณากรอกวัตถุประสงค์ของงาน');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !id) return;

    setSubmitting(true);
    try {
      // Combine all responsibilities
      const allResponsibilities = [
        ...strategicResponsibilities.filter(r => r.description.trim()).map(r => ({ category: 'strategic' as const, description: r.description })),
        ...teamManagementResponsibilities.filter(r => r.description.trim()).map(r => ({ category: 'team_management' as const, description: r.description })),
        ...generalResponsibilities.filter(r => r.description.trim()).map(r => ({ category: 'general' as const, description: r.description })),
        ...cultureResponsibilities.filter(r => r.description.trim()).map(r => ({ category: 'culture' as const, description: r.description })),
        ...efficiencyResponsibilities.filter(r => r.description.trim()).map(r => ({ category: 'efficiency' as const, description: r.description })),
        ...otherResponsibilities.filter(r => r.description.trim()).map(r => ({ category: 'other' as const, description: r.description })),
      ];

      // Combine all risks
      const allRisks = [
        ...externalRisks.filter(r => r.description.trim()).map(r => ({ type: r.type, description: r.description })),
        ...internalRisks.filter(r => r.description.trim()).map(r => ({ type: r.type, description: r.description })),
      ];

      // Combine selected predefined assets and custom assets (save asset IDs for proper linking)
      const allAssets = [...selectedAssets, ...customAssets];

      const jdData: any = {
        position,
        job_band: jobBand as JobBand,
        job_grade: jobGrade as JobGrade,
        location_id: locationId,
        department_id: departmentId,
        team_id: teamId,
        direct_supervisor: directSupervisor,
        job_purpose: jobPurpose,
        status,
        updated_by: user?.id || '550e8400-e29b-41d4-a716-446655440000',
        responsibility_percentages: responsibilityPercentages,
        responsibilities: allResponsibilities,
        risks: allRisks.map(risk => ({
          type: risk.type,
          description: risk.description,
          risk_level: 'medium' as const,
        })),
        competencies: competencyScores.filter(cs => cs.score > 0).map(cs => ({
          competency_id: cs.competencyId,
          score: cs.score,
          notes: cs.notes,
        })),
      };

      // Include company_assets - send empty array if none selected to clear existing data
      jdData.company_assets = allAssets.length > 0 ? allAssets : [];

      await updateJobDescription(id, jdData);
      navigate(`/jd/${id}`);
    } catch (error) {
      console.error(error);
      // Error is handled in the hook
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions for print display
  const getLocationName = (locId: string) => {
    return locations.find(loc => loc.id === locId)?.name || '';
  };

  const getDepartmentName = (deptId: string) => {
    return departments.find(dept => dept.id === deptId)?.name || '';
  };

  const getTeamName = (tId: string) => {
    return teams.find(team => team.id === tId)?.name || '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get all responsibilities for print display
  const getAllResponsibilities = () => {
    const allResp: { category: string; categoryLabel: string; items: ResponsibilityItem[] }[] = [];

    if (strategicResponsibilities.filter(r => r.description.trim()).length > 0) {
      allResp.push({ category: 'strategic', categoryLabel: 'Strategic (เชิงกลยุทธ์)', items: strategicResponsibilities.filter(r => r.description.trim()) });
    }
    if (teamManagementResponsibilities.filter(r => r.description.trim()).length > 0) {
      allResp.push({ category: 'team_management', categoryLabel: 'Team Management & Development', items: teamManagementResponsibilities.filter(r => r.description.trim()) });
    }
    if (generalResponsibilities.filter(r => r.description.trim()).length > 0) {
      allResp.push({ category: 'general', categoryLabel: 'General Tasks (งานทั่วไป)', items: generalResponsibilities.filter(r => r.description.trim()) });
    }
    if (cultureResponsibilities.filter(r => r.description.trim()).length > 0) {
      allResp.push({ category: 'culture', categoryLabel: 'Culture Building', items: cultureResponsibilities.filter(r => r.description.trim()) });
    }
    if (efficiencyResponsibilities.filter(r => r.description.trim()).length > 0) {
      allResp.push({ category: 'efficiency', categoryLabel: 'Improve Efficiency & Add Value', items: efficiencyResponsibilities.filter(r => r.description.trim()) });
    }
    if (otherResponsibilities.filter(r => r.description.trim()).length > 0) {
      allResp.push({ category: 'other', categoryLabel: 'Other Assigned Works', items: otherResponsibilities.filter(r => r.description.trim()) });
    }

    return allResp;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Print Version - Professional JD Layout */}
      <div className="hidden print:block">
        {/* Print Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white rounded-t-lg -mx-4 mb-0" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{position || 'Job Description'}</h1>
              <div className="flex items-center gap-3 text-blue-100 text-sm">
                <span>{jobBand} • {jobGrade}</span>
                <span>•</span>
                <span>{getDepartmentName(departmentId)}</span>
                <span>•</span>
                <span>{getLocationName(locationId)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {status === 'draft' ? 'Draft' : 'Published'}
              </span>
              {loadedJD && (
                <div className="text-blue-100 text-xs mt-2">
                  Updated: {formatDate(loadedJD.updated_at || loadedJD.created_at)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Print Content */}
        <div className="bg-white border border-gray-200 rounded-b-lg p-6 -mx-4 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Team:</span>
                <span className="ml-2 font-medium">{getTeamName(teamId)}</span>
              </div>
              {directSupervisor && (
                <div>
                  <span className="text-gray-500">Direct Supervisor:</span>
                  <span className="ml-2 font-medium">{directSupervisor}</span>
                </div>
              )}
            </div>
          </div>

          {/* Company Assets */}
          {(selectedAssets.length > 0 || customAssets.length > 0) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Company Assets (ทรัพย์สินบริษัท)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {selectedAssets.map((assetId) => {
                  const asset = assets.find(a => a.id === assetId);
                  return asset ? (
                    <div key={assetId} className="flex items-center p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                      <span className="text-gray-400 mr-2">✓</span>
                      <span className="text-gray-700">{asset.name}</span>
                    </div>
                  ) : null;
                })}
                {customAssets.map((customAsset, index) => (
                  <div key={`custom_${index}`} className="flex items-center p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                    <span className="text-gray-400 mr-2">✓</span>
                    <span className="text-gray-700">{customAsset}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job Purpose */}
          {jobPurpose && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Job Purpose (วัตถุประสงค์ของงาน)</h3>
              <p className="text-gray-700 leading-relaxed text-sm">{jobPurpose}</p>
            </div>
          )}

          {/* Responsibilities */}
          {getAllResponsibilities().length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Responsibilities (หน้าที่ความรับผิดชอบ)</h3>
              <div className="space-y-4">
                {getAllResponsibilities().map((respGroup) => (
                  <div key={respGroup.category} className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-700 mb-2 text-sm">{respGroup.categoryLabel}</h4>
                    <ul className="space-y-1">
                      {respGroup.items.map((item, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <span className="text-gray-400 mr-2">•</span>
                          <span className="text-gray-600">{item.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Competencies with Spider Chart */}
          {getSpiderChartData().length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Core Competencies (สมรรถนะหลัก)</h3>

              {/* Spider Chart */}
              <div className="flex justify-center mb-4">
                <SpiderChart data={getSpiderChartData()} size={280} />
              </div>

              {/* Competency Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                {getSpiderChartData().map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                    <span className="font-medium text-gray-700 text-sm">{item.name}</span>
                    <span className={`font-bold text-sm ${
                      item.score >= 4 ? 'text-green-600' : item.score >= 3 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {item.score}/5
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {(externalRisks.some(r => r.description.trim()) || internalRisks.some(r => r.description.trim())) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Risk Factors (ความเสี่ยง)</h3>
              <div className="space-y-4">
                {externalRisks.filter(r => r.description.trim()).length > 0 && (
                  <div className="rounded-lg overflow-hidden border border-red-200">
                    <div className="bg-red-50 px-4 py-2 border-l-4 border-red-500">
                      <h4 className="font-semibold text-red-600 text-sm">External Risks (ความเสี่ยงภายนอก)</h4>
                    </div>
                    <ul className="p-3 space-y-2 bg-white">
                      {externalRisks.filter(r => r.description.trim()).map((risk, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <span className="text-red-400 mr-2 mt-0.5">●</span>
                          <span className="text-gray-700">{risk.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {internalRisks.filter(r => r.description.trim()).length > 0 && (
                  <div className="rounded-lg overflow-hidden border border-blue-200">
                    <div className="bg-blue-50 px-4 py-2 border-l-4 border-blue-500">
                      <h4 className="font-semibold text-blue-600 text-sm">Internal Risks (ความเสี่ยงภายใน)</h4>
                    </div>
                    <ul className="p-3 space-y-2 bg-white">
                      {internalRisks.filter(r => r.description.trim()).map((risk, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <span className="text-blue-400 mr-2 mt-0.5">●</span>
                          <span className="text-gray-700">{risk.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 pt-4 border-t">
            Job Description Management System • Printed on {new Date().toLocaleDateString('th-TH')}
          </div>
        </div>
      </div>

      {/* Screen Version - Edit Form */}
      <div className="print:hidden">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={handleCancel}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary-600">{position || 'Edit Job Description'}</h1>
              <p className="text-primary-400 mt-1">Update the job description details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={handlePrint}
              icon={<Printer className="w-4 h-4" />}
            >
              Print
            </Button>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'
            }`}>
              {status === 'draft' ? 'Draft' : 'Published'}
            </span>
          </div>
        </div>

      {/* Main Form Card */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6 shadow-sm space-y-6">
        {/* Basic Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <PositionAutocomplete
            value={position}
            onChange={setPosition}
            required
          />
          <PositionAutocomplete
            label="Direct Supervisor (หัวหน้างานโดยตรง)"
            value={directSupervisor}
            onChange={setDirectSupervisor}
            placeholder="พิมพ์เพื่อค้นหาตำแหน่งหัวหน้างาน..."
          excludeValue={position}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Select
            label="Job Band (ระดับงาน)"
            value={jobBand}
            onChange={(e) => {
              setJobBand(e.target.value as JobBand);
              setJobGrade('');
            }}
          >
            <option value="">Select job band</option>
            {jobBands.map((band) => (
              <option key={band.id} value={band.name}>
                {band.name}
              </option>
            ))}
          </Select>

          <Select
            label="Job Grade (ขั้นงาน)"
            value={jobGrade}
            onChange={(e) => setJobGrade(e.target.value as JobGrade)}
            disabled={!jobBand}
          >
            <option value="">Select job band first</option>
            {getAvailableGrades().map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </Select>

          <Select
            label="Location (สถานที่)"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            required
          >
            <option value="">Select location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Select
            label="Department (แผนก)"
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setTeamId('');
            }}
            required
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </Select>

          <Select
            label="Team (ทีม)"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            disabled={!departmentId}
            required
          >
            <option value="">Select department first</option>
            {filteredTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Job Purpose */}
        <div>
          <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2 border-b-2 border-green-200 pb-2">
            <Target className="w-5 h-5" />
            Job Purpose (วัตถุประสงค์ของงาน) *
          </h3>
          <p className="text-sm font-medium text-gray-700 mb-3">
            สรุปเป้าหมายหลักของตำแหน่ง เพื่อให้งานสอดคล้องกับทิศทางและเป้าหมายขององค์กร
          </p>
          <Textarea
            value={jobPurpose}
            onChange={(e) => setJobPurpose(e.target.value)}
            placeholder="Describe the main purpose of this role..."
            rows={3}
            required
          />
        </div>
        {/* Responsibilities Section */}
        <div className="border-t border-primary-200 pt-6">
          <h3 className="text-lg font-semibold text-orange-600 mb-6 flex items-center gap-2 border-b-2 border-orange-200 pb-2">
            <ClipboardList className="w-5 h-5" />
            Responsibilities (หน้าที่ความรับผิดชอบ)
          </h3>

          {/* Strategic */}
          <div className="space-y-6 pt-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-base font-semibold text-indigo-600">Strategic (เชิงกลยุทธ์)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={responsibilityPercentages.strategic || ''}
                      onChange={(e) => updatePercentage('strategic', parseInt(e.target.value))}
                      className="w-16 px-2 py-1 text-center border border-indigo-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0"
                    />
                    <span className="text-sm text-primary-500">%</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addResponsibility('strategic')}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Item
                </Button>
              </div>
              <p className="mb-2 text-sm text-primary-500">
                คิดวิเคราะห์ วางแผน และกำหนดแนวทางเชิงกลยุทธ์เพื่อพัฒนาองค์กรและสร้างคุณค่าในระยะยาว
                <span className="block italic mt-1">ตัวอย่าง: วิเคราะห์ข้อมูลเชิงลึกเพื่อนำมาวางแผนกลยุทธ์การพัฒนาทีมและองค์กร</span>
              </p>
              <div className="space-y-2">
                {strategicResponsibilities.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item.description}
                      onChange={(e) => updateResponsibility('strategic', index, e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'strategic', index)}
                      placeholder="Enter strategic item..."
                      data-category="strategic"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResponsibility('strategic', index)}
                      icon={<Trash2 className="w-4 h-4" />}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Management */}
          <div className="space-y-6 border-t border-primary-200 pt-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-base font-semibold text-cyan-600">
                    Team Management & Development (การบริหารทีม และการพัฒนาบุคลากร)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={responsibilityPercentages.team_management || ''}
                      onChange={(e) => updatePercentage('team_management', parseInt(e.target.value))}
                      className="w-16 px-2 py-1 text-center border border-cyan-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="0"
                    />
                    <span className="text-sm text-primary-500">%</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addResponsibility('team_management')}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Item
                </Button>
              </div>
              <p className="mb-2 text-sm text-primary-500">
                ดูแล สนับสนุน และพัฒนาศักยภาพของทีมให้ทำงานอย่างมีประสิทธิภาพ
                <span className="block italic mt-1">ตัวอย่าง: ให้คำแนะนำและ Feedback เพื่อพัฒนาทักษะการทำงานของทีม</span>
              </p>
              <div className="space-y-2">
                {teamManagementResponsibilities.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item.description}
                      onChange={(e) => updateResponsibility('team_management', index, e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'team_management', index)}
                      placeholder="Enter team management item..."
                      data-category="team_management"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResponsibility('team_management', index)}
                      icon={<Trash2 className="w-4 h-4" />}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* General Tasks */}
          <div className="space-y-6 border-t border-primary-200 pt-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-base font-semibold text-amber-600">General Tasks (งานทั่วไป)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={responsibilityPercentages.general || ''}
                      onChange={(e) => updatePercentage('general', parseInt(e.target.value))}
                      className="w-16 px-2 py-1 text-center border border-amber-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="0"
                    />
                    <span className="text-sm text-primary-500">%</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addResponsibility('general')}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Item
                </Button>
              </div>
              <p className="mb-2 text-sm text-primary-500">
                ดำเนินงานสนับสนุนและงานประจำของแผนกให้เป็นไปตามแผนและมาตรฐานขององค์กร
                <span className="block italic mt-1">ตัวอย่าง: ดูแลการใช้งบประมาณและติดตามความคืบหน้าโครงการให้เสร็จตามกำหนด</span>
              </p>
              <div className="space-y-2">
                {generalResponsibilities.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item.description}
                      onChange={(e) => updateResponsibility('general', index, e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'general', index)}
                      placeholder="Enter general task item..."
                      data-category="general"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResponsibility('general', index)}
                      icon={<Trash2 className="w-4 h-4" />}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Culture Building */}
          <div className="space-y-6 border-t border-primary-200 pt-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-base font-semibold text-rose-600">
                    Culture Building (การสร้างและส่งเสริมวัฒนธรรมองค์กร)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={responsibilityPercentages.culture || ''}
                      onChange={(e) => updatePercentage('culture', parseInt(e.target.value))}
                      className="w-16 px-2 py-1 text-center border border-rose-300 rounded-md text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="0"
                    />
                    <span className="text-sm text-primary-500">%</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addResponsibility('culture')}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Item
                </Button>
              </div>
              <p className="mb-2 text-sm text-primary-500">
                ส่งเสริมวัฒนธรรมการทำงานที่ดีภายในทีมและองค์กร พร้อมเป็นแบบอย่างที่สะท้อนค่านิยมหลักขององค์กร
                <span className="block italic mt-1">ตัวอย่าง: ร่วมพัฒนาและขับเคลื่อนกิจกรรมหรือแนวทางที่สร้างบรรยากาศการทำงานเชิงบวก</span>
              </p>
              <div className="space-y-2">
                {cultureResponsibilities.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item.description}
                      onChange={(e) => updateResponsibility('culture', index, e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'culture', index)}
                      placeholder="Enter culture building item..."
                      data-category="culture"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResponsibility('culture', index)}
                      icon={<Trash2 className="w-4 h-4" />}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Improve Efficiency */}
          <div className="space-y-6 border-t border-primary-200 pt-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-base font-semibold text-emerald-600">
                  Improve Efficiency & Add Value (การเพิ่มประสิทธิภาพและสร้างคุณค่าใหม่ๆ)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={responsibilityPercentages.efficiency || ''}
                      onChange={(e) => updatePercentage('efficiency', parseInt(e.target.value))}
                      className="w-16 px-2 py-1 text-center border border-emerald-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="0"
                    />
                    <span className="text-sm text-primary-500">%</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addResponsibility('efficiency')}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Item
                </Button>
              </div>
              <p className="mb-2 text-sm text-primary-500">
                มุ่งพัฒนาและปรับปรุงกระบวนการทำงานให้มีประสิทธิภาพมากขึ้น พร้อมสร้างแนวทางหรือนวัตกรรมใหม่ที่ช่วยเพิ่มคุณค่าให้กับองค์กรและตัวบุคคล
                <span className="block italic mt-1">ตัวอย่าง: พัฒนาวิธีการทำงานใหม่เพื่อลดเวลาและเพิ่มคุณภาพของผลลัพธ์</span>
              </p>
              <div className="space-y-2">
                {efficiencyResponsibilities.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item.description}
                      onChange={(e) => updateResponsibility('efficiency', index, e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'efficiency', index)}
                      placeholder="Enter efficiency improvement item..."
                      data-category="efficiency"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResponsibility('efficiency', index)}
                      icon={<Trash2 className="w-4 h-4" />}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Other Assigned Works */}
          <div className="space-y-6 border-t border-primary-200 pt-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-base font-semibold text-violet-600">
                    Other Assigned Works (หน้าที่ความรับผิดชอบด้านอื่นๆ)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={responsibilityPercentages.other || ''}
                      onChange={(e) => updatePercentage('other', parseInt(e.target.value))}
                      className="w-16 px-2 py-1 text-center border border-violet-300 rounded-md text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      placeholder="0"
                    />
                    <span className="text-sm text-primary-500">%</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addResponsibility('other')}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Item
                </Button>
              </div>
              <p className="mb-2 text-sm text-primary-500">
                งานอื่นๆ ที่ได้รับมอบหมายเพิ่มเติมนอกเหนือจากหน้าที่หลัก
                <span className="block italic mt-1">ตัวอย่าง: โครงการพิเศษหรืองานที่ได้รับมอบหมายตามความเหมาะสม</span>
              </p>
              <div className="space-y-2">
                {otherResponsibilities.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item.description}
                      onChange={(e) => updateResponsibility('other', index, e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'other', index)}
                      placeholder="Enter other assigned work item..."
                      data-category="other"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResponsibility('other', index)}
                      icon={<Trash2 className="w-4 h-4" />}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Percentage Summary Bar */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">สัดส่วนรวม:</span>
              <span className={`text-lg font-bold ${totalPercentage === 100 ? 'text-green-600' : totalPercentage > 100 ? 'text-red-600' : 'text-amber-600'}`}>
                {totalPercentage}%
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${totalPercentage === 100 ? 'bg-green-500' : totalPercentage > 100 ? 'bg-red-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(totalPercentage, 100)}%` }}
              />
            </div>
            {totalPercentage !== 100 && (
              <p className={`mt-2 text-sm ${totalPercentage > 100 ? 'text-red-600' : 'text-amber-600'}`}>
                {totalPercentage > 100 ? 'เกิน 100% กรุณาปรับลดสัดส่วน' : `ยังขาดอีก ${100 - totalPercentage}% เพื่อให้ครบ 100%`}
              </p>
            )}
          </div>
        </div>
        {/* Core Competencies */}
        <div className="border-t border-primary-200 pt-6">
          <h3 className="text-lg font-semibold text-pink-600 mb-4 flex items-center gap-2 border-b-2 border-pink-200 pb-2">
            <Award className="w-5 h-5" />
            Core Competencies (สมรรถนะหลัก)
          </h3>
          <p className="mb-6 text-body text-primary-500 print:hidden">
            ทักษะและคุณลักษณะสำคัญที่พนักงานทุกคนควรมี เพื่อทำงานได้อย่างมีประสิทธิภาพและสอดคล้องกับค่านิยมองค์กร
          </p>

          {/* Spider Chart for Print Mode */}
          {getSpiderChartData().length > 0 && (
            <div className="hidden print:flex print:flex-col print:items-center mb-6">
              <SpiderChart data={getSpiderChartData()} size={320} />
              {/* Competency scores list for print */}
              <div className="mt-4 w-full grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                {getSpiderChartData().map((item, index) => (
                  <div key={index} className="flex justify-between border-b border-gray-200 py-1">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className="font-bold text-amber-600">{item.score}/5</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Normal Edit Mode - Slider Controls */}
          <div className="space-y-6 print:hidden">
            {competencies.map((comp) => {
              const compScore = competencyScores.find((cs) => cs.competencyId === comp.id);
              const score = compScore?.score || 0;
              const notes = compScore?.notes || '';

              return (
                <div key={comp.id}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div>
                      <label className="block text-body-sm font-semibold text-primary-600 mb-2">
                        {comp.name}
                      </label>
                    </div>
                    <div>
                      <Slider
                        label="Required Level"
                        value={score}
                        onChange={(value) => updateCompetencyScore(comp.id, 'score', value)}
                        min={0}
                        max={5}
                        colorCoded
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm font-semibold text-primary-600 mb-2">
                        Notes (Optional)
                      </label>
                      <Input
                        value={notes}
                        onChange={(e) => updateCompetencyScore(comp.id, 'notes', e.target.value)}
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Section */}
        <div className="border-t border-primary-200 pt-6">
          <h3 className="text-lg font-semibold text-amber-600 mb-4 flex items-center gap-2 border-b-2 border-amber-200 pb-2">
            <AlertTriangle className="w-5 h-5" />
            Risk Factors (ความเสี่ยง)
          </h3>
          <p className="text-sm text-primary-500 mb-4">
            ประเด็นหรือปัจจัยที่อาจส่งผลกระทบต่อการดำเนินงาน การบรรลุเป้าหมาย หรือประสิทธิภาพของตำแหน่ง/ทีม
          </p>

          {/* External Risks */}
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-red-600 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  External Risks (ความเสี่ยงภายนอก)
                </h4>
                <p className="mt-1 text-sm text-primary-500">
                  ความเสี่ยงที่เกิดจากปัจจัยภายนอกองค์กร ซึ่งอยู่นอกเหนือการควบคุมโดยตรง เช่น เศรษฐกิจ การเมือง คู่ค้า หรือเทคโนโลยี
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setExternalRisks([...externalRisks, { type: 'external', description: '' }])}
                icon={<Plus className="w-4 h-4" />}
              >
                Add External Risk
              </Button>
            </div>
            <div className="space-y-3">
              {externalRisks.map((risk, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={risk.description}
                    onChange={(e) => updateExternalRisk(index, e.target.value)}
                    onKeyPress={(e) => handleRiskKeyPress(e, 'external', index)}
                    placeholder="Describe external risk..."
                    className="flex-1"
                    data-risk-type="external"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExternalRisk(index)}
                    icon={<Trash2 className="w-4 h-4" />}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Internal Risks */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Internal Risks (ความเสี่ยงภายใน)
                </h4>
                <p className="mt-1 text-sm text-primary-500">
                  ความเสี่ยงที่เกิดจากปัจจัยภายในองค์กร ซึ่งสามารถควบคุมหรือบริหารจัดการได้ เช่น บุคลากร ระบบการทำงาน หรือขั้นตอนภายใน
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setInternalRisks([...internalRisks, { type: 'internal', description: '' }])}
                icon={<Plus className="w-4 h-4" />}
              >
                Add Internal Risk
              </Button>
            </div>
            <div className="space-y-3">
              {internalRisks.map((risk, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={risk.description}
                    onChange={(e) => updateInternalRisk(index, e.target.value)}
                    onKeyPress={(e) => handleRiskKeyPress(e, 'internal', index)}
                    placeholder="Describe internal risk..."
                    className="flex-1"
                    data-risk-type="internal"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInternalRisk(index)}
                    icon={<Trash2 className="w-4 h-4" />}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Company Assets */}
        <div className="border-t border-primary-200 pt-6">
          <h3 className="text-lg font-semibold text-purple-600 mb-3 flex items-center gap-2 border-b-2 border-purple-200 pb-2">
            <Package className="w-5 h-5" />
            Company Assets (ทรัพย์สินบริษัท)
          </h3>
          <p className="text-sm text-primary-500 mb-3">
            เลือกทรัพย์สินบริษัทที่จะมอบให้กับตำแหน่งนี้ (สามารถเลือกได้หลายรายการ)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {assets.map((asset) => (
              <label
                key={asset.id}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedAssets.includes(asset.id)
                    ? 'border-accent-500 bg-accent-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedAssets.includes(asset.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAssets([...selectedAssets, asset.id]);
                    } else {
                      setSelectedAssets(selectedAssets.filter(id => id !== asset.id));
                    }
                  }}
                  className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-900">{asset.name}</span>
              </label>
            ))}
            {assets.length === 0 && (
              <div className="col-span-full">
                <p className="text-sm text-gray-500 italic">
                  ยังไม่มีทรัพย์สินบริษัท กรุณาเพิ่มใน Settings → Company Assets
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-primary-200 pt-6 print:hidden">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-primary-600">Status:</label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="w-32"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={totalPercentage !== 100}
              icon={<Save className="w-4 h-4" />}
              title={totalPercentage !== 100 ? 'สัดส่วนความรับผิดชอบต้องรวมกันเท่ากับ 100%' : ''}
            >
              Update Job Description
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
