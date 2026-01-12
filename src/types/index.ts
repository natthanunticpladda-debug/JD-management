export type UserRole = 'admin' | 'manager' | 'viewer';

export type JobBand = 'JB 1' | 'JB 2' | 'JB 3' | 'JB 4' | 'JB 5';

export type JobGrade =
  | 'JG 1.1 Staff'
  | 'JG 1.2 Senior Staff'
  | 'JG 2.1 Supervisor'
  | 'JG 2.1 Specialist'
  | 'JG 2.2 Assistant Manager'
  | 'JG 2.2 Senior Specialist'
  | 'JG 3.1 Manager'
  | 'JG 3.1 Lead Specialist'
  | 'JG 3.2 Senior Manager'
  | 'JG 3.2 Lead Specialist'
  | 'JG 4.1 Assistant Vice President'
  | 'JG 4.1 Lead Specialist'
  | 'JG 4.2 Vice President'
  | 'JG 5 President';

export type JDStatus = 'draft' | 'published' | 'archived';

export type ResponsibilityCategory =
  | 'key'
  | 'strategic'
  | 'team_management'
  | 'general'
  | 'culture'
  | 'efficiency'
  | 'other';

export type RiskType = 'external' | 'internal';

export type RiskLevel = 'low' | 'medium' | 'high';

export type ActivityAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'archive'
  | 'password_change'
  | 'role_change'
  | 'team_assign'
  | 'team_remove'
  | 'user_delete';

export type ActivityEntityType =
  | 'job_description'
  | 'user'
  | 'location'
  | 'department'
  | 'team'
  | 'competency';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  team_id: string | null;
  location_id: string;
  department_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  location?: Location;
  department?: Department;
  team?: Team;
}

export interface Department {
  id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  department_id: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Competency {
  id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface JobBandEntity {
  id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface JobGradeEntity {
  id: string;
  name: string;
  job_band_id: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface JobDescription {
  id: string;
  position: string;
  job_band: JobBand;
  job_grade: JobGrade;
  location_id: string;
  department_id: string;
  team_id: string;
  direct_supervisor: string;
  job_purpose: string;
  status: JDStatus;
  created_by: string;
  updated_by: string;
  version: number;
  parent_version_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface JDResponsibility {
  id: string;
  jd_id: string;
  category: ResponsibilityCategory;
  description: string;
  order_index: number;
  created_at: string;
}

export interface JDRisk {
  id: string;
  jd_id: string;
  type: RiskType;
  description: string;
  risk_level: RiskLevel;
  order_index: number;
  created_at: string;
}

export interface JDCompetency {
  id: string;
  jd_id: string;
  competency_id: string;
  score: number;
  notes?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: ActivityAction;
  entity_type: ActivityEntityType;
  entity_id: string | null;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
  };
}

export const JOB_GRADES: JobGrade[] = [
  'JG 1.1 Staff',
  'JG 1.2 Senior Staff',
  'JG 2.1 Supervisor',
  'JG 2.1 Specialist',
  'JG 2.2 Assistant Manager',
  'JG 2.2 Senior Specialist',
  'JG 3.1 Manager',
  'JG 3.1 Lead Specialist',
  'JG 3.2 Senior Manager',
  'JG 3.2 Lead Specialist',
  'JG 4.1 Assistant Vice President',
  'JG 4.1 Lead Specialist',
  'JG 4.2 Vice President',
  'JG 5 President',
];

export const LOCATIONS = ['Bangkok', 'Nakhon Pathom'];

export const RESPONSIBILITY_CATEGORIES = {
  key: 'Key Responsibilities',
  strategic: 'Strategic',
  team_management: 'Team Management & Development',
  general: 'General Tasks',
  culture: 'Culture Building',
  efficiency: 'Improve Efficiency & Add Value',
  other: 'Other Assigned Works',
};
// API Types for CRUD operations (matching Supabase schema)
export interface JobDescriptionAPI {
  id: string;
  position: string;
  job_band: JobBand;
  job_grade: JobGrade;
  location_id: string;
  department_id: string;
  team_id: string;
  direct_supervisor?: string;
  job_purpose: string;
  status: JDStatus;
  created_by: string;
  updated_by?: string;
  version: number;
  parent_version_id?: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  location?: Location;
  department?: Department;
  team?: Team;
  responsibilities?: JDResponsibility[];
  risks?: JDRisk[];
  competencies?: (JDCompetency & { competency?: Competency })[];
}

export interface ResponsibilityItemAPI {
  category: ResponsibilityCategory;
  description: string;
  order_index?: number;
}

export interface RiskItemAPI {
  type: RiskType;
  description: string;
  risk_level: RiskLevel;
  order_index?: number;
}

export interface CompetencyScoreAPI {
  competency_id: string;
  score: number;
  notes?: string;
}

// Form Types
export interface CreateJobDescriptionData {
  position: string;
  job_band: JobBand;
  job_grade: JobGrade;
  location_id: string;
  department_id: string;
  team_id: string;
  direct_supervisor?: string;
  job_purpose: string;
  status: JDStatus;
  created_by: string;
  responsibilities?: ResponsibilityItemAPI[];
  risks?: RiskItemAPI[];
  competencies?: CompetencyScoreAPI[];
}

export interface UpdateJobDescriptionData extends Partial<CreateJobDescriptionData> {
  updated_by?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Search and Filter Types
export interface JobDescriptionFilters {
  search?: string;
  status?: JDStatus;
  departmentId?: string;
  locationId?: string;
  jobBand?: JobBand;
  jobGrade?: JobGrade;
}