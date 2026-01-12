import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useJobDescriptions } from '../../hooks/useJobDescriptions';
import { useLocations } from '../../hooks/useLocations';
import { useDepartments } from '../../hooks/useDepartments';
import { useTeams } from '../../hooks/useTeams';
import { useCompetencies } from '../../hooks/useCompetencies';
import { useJobBands } from '../../hooks/useJobBands';
import { useJobGrades } from '../../hooks/useJobGrades';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Slider } from '../../components/ui/Slider';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import type {
  JobBand,
  JobGrade,
} from '../../types';
import toast from 'react-hot-toast';

const JOB_BANDS: JobBand[] = ['JB 1', 'JB 2', 'JB 3', 'JB 4', 'JB 5'];

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

export const CreateJDPage = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/job-descriptions');
    }
  };
  const { user } = useAuth();
  const { createJobDescription } = useJobDescriptions();
  const { locations } = useLocations();
  const { departments } = useDepartments();
  const { teams } = useTeams();
  const { competencies } = useCompetencies();
  const { jobBands } = useJobBands();
  const { jobGrades } = useJobGrades();

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

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

  // Responsibilities by category
  const [strategicResponsibilities, setStrategicResponsibilities] = useState<ResponsibilityItem[]>([]);
  const [teamManagementResponsibilities, setTeamManagementResponsibilities] = useState<ResponsibilityItem[]>([]);
  const [generalResponsibilities, setGeneralResponsibilities] = useState<ResponsibilityItem[]>([]);
  const [cultureResponsibilities, setCultureResponsibilities] = useState<ResponsibilityItem[]>([]);
  const [efficiencyResponsibilities, setEfficiencyResponsibilities] = useState<ResponsibilityItem[]>([]);
  const [otherResponsibilities, setOtherResponsibilities] = useState<ResponsibilityItem[]>([]);

  // Risks
  const [externalRisks, setExternalRisks] = useState<Risk[]>([{ type: 'external', description: '' }]);
  const [internalRisks, setInternalRisks] = useState<Risk[]>([{ type: 'internal', description: '' }]);

  // Competencies
  const [competencyScores, setCompetencyScores] = useState<CompetencyScore[]>([]);

  // Initialize competency scores when competencies are loaded
  useEffect(() => {
    if (competencies.length > 0 && competencyScores.length === 0) {
      setCompetencyScores(
        competencies.map((comp) => ({ competencyId: comp.id, score: 0, notes: '' }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competencies.length]);

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
    if (!validateForm()) return;

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

      const jdData = {
        position,
        job_band: jobBand as JobBand,
        job_grade: jobGrade as JobGrade,
        location_id: locationId,
        department_id: departmentId,
        team_id: teamId,
        direct_supervisor: directSupervisor,
        job_purpose: jobPurpose,
        status,
        created_by: user?.id || '550e8400-e29b-41d4-a716-446655440000', // Use test user ID if no auth
        responsibilities: allResponsibilities,
        risks: allRisks.map(risk => ({
          type: risk.type,
          description: risk.description,
          risk_level: 'medium' as const, // Default risk level
        })),
        competencies: competencyScores.filter(cs => cs.score > 0).map(cs => ({
          competency_id: cs.competencyId,
          score: cs.score,
          notes: cs.notes,
        })),
      };

      const createdJD = await createJobDescription(jdData);
      navigate(`/jd/${createdJD.id}`);
    } catch (error) {
      console.error(error);
      // Error is handled in the hook
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
            <h1 className="text-3xl font-bold text-primary-600">Create Job Description</h1>
            <p className="text-primary-400 mt-1">Fill in the details below</p>
          </div>
        </div>
        <div>
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
          <Input
            label="Position (ตำแหน่งงาน)"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g., Senior Operations Analyst"
            required
          />
          <Input
            label="Direct Supervisor (หัวหน้างานโดยตรง)"
            value={directSupervisor}
            onChange={(e) => setDirectSupervisor(e.target.value)}
            placeholder="e.g., Department Manager, Assistant Managing Director"
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
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Job Purpose (วัตถุประสงค์ของงาน) *
          </label>
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
          <h2 className="text-2xl font-bold text-primary-600 mb-6">
            Responsibilities (หน้าที่ความรับผิดชอบ)
          </h2>

          {/* Strategic */}
          <div className="space-y-6 pt-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-base font-semibold text-primary-600">Strategic (เชิงกลยุทธ์)</label>
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
                <label className="text-base font-semibold text-primary-600">
                  Team Management & Development (การบริหารทีม และการพัฒนาบุคลากร)
                </label>
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
                <label className="text-base font-semibold text-primary-600">General Tasks (งานทั่วไป)</label>
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
                <label className="text-base font-semibold text-primary-600">
                  Culture Building (การสร้างและส่งเสริมวัฒนธรรมองค์กร)
                </label>
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
                <label className="text-base font-semibold text-primary-600">
                  Improve Efficiency & Add Value (การเพิ่มประสิทธิภาพและสร้างคุณค่าใหม่ๆ)
                </label>
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
                <label className="text-base font-semibold text-primary-600">
                  Other Assigned Works (หน้าที่ความรับผิดชอบด้านอื่นๆ)
                </label>
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
        </div>
        {/* Core Competencies */}
        <div className="border-t border-primary-200 pt-6">
          <label className="block text-heading-3 font-bold text-primary-600 mb-2">
            Core Competencies (สมรรถนะหลัก)
          </label>
          <p className="mb-6 text-body text-primary-500">
            ทักษะและคุณลักษณะสำคัญที่พนักงานทุกคนควรมี เพื่อทำงานได้อย่างมีประสิทธิภาพและสอดคล้องกับค่านิยมองค์กร
          </p>
          <div className="space-y-6">
            {competencies.map((comp) => {
              const compScore = competencyScores.find((cs) => cs.competencyId === comp.id);
              const score = compScore?.score || 0;
              const notes = compScore?.notes || '';

              return (
                <div key={comp.id}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div>
                      <label className="block text-body-sm font-semibold text-primary-600 mb-2">
                        Competency Name
                      </label>
                      <Input value={comp.name} disabled className="bg-primary-50/50 text-primary-600 font-medium" />
                    </div>
                    <div>
                      <label className="block text-body-sm font-semibold text-primary-600 mb-2">
                        Score (0-5) (0 = น้อยที่สุด, 5 = มากที่สุด)
                      </label>
                      <Slider
                        label="Score"
                        value={score}
                        onChange={(value) => updateCompetencyScore(comp.id, 'score', value)}
                        min={0}
                        max={5}
                        colorCoded={true}
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
          <div className="mb-4">
            <label className="block text-base font-semibold text-primary-600">Risk (ความเสี่ยง)</label>
            <p className="mt-1 text-sm text-primary-500">
              ประเด็นหรือปัจจัยที่อาจส่งผลกระทบต่อการดำเนินงาน การบรรลุเป้าหมาย หรือประสิทธิภาพของตำแหน่ง/ทีม
            </p>
          </div>

          {/* External Risks */}
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <label className="text-base font-semibold text-primary-600">External Risks (ความเสี่ยงภายนอก)</label>
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
                <label className="text-base font-semibold text-accent-600">Internal Risks (ความเสี่ยงภายใน)</label>
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

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-primary-200 pt-6">
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
              icon={<Save className="w-4 h-4" />}
            >
              Create Job Description
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};