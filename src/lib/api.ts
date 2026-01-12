// API Client using Supabase
import { supabase } from './supabase';
import './test-api'; // Import test functions
import type {
  JobDescriptionAPI,
  CreateJobDescriptionData,
  UpdateJobDescriptionData,
  JobDescriptionFilters,
  Location,
  Department,
  Team,
  Competency,
  User,
} from '../types';

// Job Descriptions API
export const jobDescriptionsAPI = {
  // Get all job descriptions with optional filters
  getAll: async (_filters?: JobDescriptionFilters): Promise<JobDescriptionAPI[]> => {
    try {
      // Query with relations
      const { data, error } = await supabase
        .from('job_descriptions')
        .select(`
          *,
          location:locations(id, name),
          department:departments(id, name),
          team:teams(id, name)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Supabase Error:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Get job description by ID with related data
  getById: async (id: string): Promise<JobDescriptionAPI> => {
    console.log('=== API getById called ===');
    console.log('ID:', id);
    
    const { data, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('id', id)
      .single();

    console.log('Main JD query result:', { data, error });

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    // Fetch related responsibilities
    console.log('Fetching responsibilities...');
    const { data: responsibilities } = await supabase
      .from('jd_responsibilities')
      .select('*')
      .eq('jd_id', id)
      .order('order_index');

    console.log('Responsibilities:', responsibilities?.length || 0);

    // Fetch related risks
    console.log('Fetching risks...');
    const { data: risks } = await supabase
      .from('jd_risks')
      .select('*')
      .eq('jd_id', id)
      .order('order_index');

    console.log('Risks:', risks?.length || 0);

    // Fetch related competencies with competency names
    console.log('Fetching competencies...');
    const { data: competencies } = await supabase
      .from('jd_competencies')
      .select(`
        *,
        competency:competencies(id, name)
      `)
      .eq('jd_id', id);

    console.log('Competencies:', competencies?.length || 0);

    // Attach related data to the job description
    const result = {
      ...data,
      responsibilities: responsibilities || [],
      risks: risks || [],
      competencies: competencies || [],
    };
    
    console.log('=== API getById returning ===');
    console.log('Result:', result);
    
    return result;
  },

  // Create new job description
  create: async (data: CreateJobDescriptionData): Promise<JobDescriptionAPI> => {
    try {
      console.log('Creating job description with data:', data);

      // Validate required fields
      if (!data.position || !data.job_band || !data.job_grade || !data.location_id || !data.department_id || !data.team_id || !data.job_purpose) {
        throw new Error('Missing required fields');
      }

      // 1. Create main job description record
      const insertData = {
        position: data.position,
        job_band: data.job_band,
        job_grade: data.job_grade,
        location_id: data.location_id,
        department_id: data.department_id,
        team_id: data.team_id,
        direct_supervisor: data.direct_supervisor || '',
        job_purpose: data.job_purpose,
        status: data.status || 'draft',
        created_by: data.created_by,
        updated_by: data.created_by,
      };

      console.log('Inserting job description:', insertData);

      const { data: jdResult, error: jdError } = await supabase
        .from('job_descriptions')
        .insert([insertData])
        .select('*')
        .single();

      if (jdError) {
        console.error('Supabase error creating job description:', jdError);
        throw new Error(`Database error: ${jdError.message}`);
      }

      if (!jdResult) {
        throw new Error('No data returned from job description creation');
      }

      console.log('Job description created successfully:', jdResult);
      const jdId = jdResult.id;

      // 2. Insert responsibilities if provided
      if (data.responsibilities && data.responsibilities.length > 0) {
        console.log('Inserting responsibilities:', data.responsibilities);
        
        const responsibilityInserts = data.responsibilities.map((resp, index) => ({
          jd_id: jdId,
          category: resp.category,
          description: resp.description,
          order_index: resp.order_index || index,
        }));

        const { error: respError } = await supabase
          .from('jd_responsibilities')
          .insert(responsibilityInserts);

        if (respError) {
          console.error('Error creating responsibilities:', respError);
          // Continue anyway, don't fail the whole operation
        }
      }

      // 3. Insert risks if provided
      if (data.risks && data.risks.length > 0) {
        console.log('Inserting risks:', data.risks);
        
        const riskInserts = data.risks.map((risk, index) => ({
          jd_id: jdId,
          type: risk.type,
          description: risk.description,
          risk_level: risk.risk_level || 'medium',
          order_index: risk.order_index || index,
        }));

        const { error: riskError } = await supabase
          .from('jd_risks')
          .insert(riskInserts);

        if (riskError) {
          console.error('Error creating risks:', riskError);
          // Continue anyway, don't fail the whole operation
        }
      }

      // 4. Insert competencies if provided
      if (data.competencies && data.competencies.length > 0) {
        console.log('Inserting competencies:', data.competencies);
        
        const competencyInserts = data.competencies
          .filter(comp => comp.score > 0) // Only insert competencies with scores
          .map(comp => ({
            jd_id: jdId,
            competency_id: comp.competency_id,
            score: comp.score,
            notes: comp.notes || null,
          }));

        if (competencyInserts.length > 0) {
          const { error: compError } = await supabase
            .from('jd_competencies')
            .insert(competencyInserts);

          if (compError) {
            console.error('Error creating competencies:', compError);
            // Continue anyway, don't fail the whole operation
          }
        }
      }

      // 5. Return the created job description
      return jdResult;
    } catch (error) {
      console.error('API Error in create job description:', error);
      throw error;
    }
  },

  // Update job description
  update: async (id: string, data: UpdateJobDescriptionData): Promise<JobDescriptionAPI> => {
    try {
      console.log('Updating job description with data:', data);

      // 1. Update main job description record
      const updateData = {
        position: data.position,
        job_band: data.job_band,
        job_grade: data.job_grade,
        location_id: data.location_id,
        department_id: data.department_id,
        team_id: data.team_id,
        direct_supervisor: data.direct_supervisor || '',
        job_purpose: data.job_purpose,
        status: data.status || 'draft',
        updated_by: data.updated_by,
        updated_at: new Date().toISOString(),
      };

      console.log('Updating job description:', updateData);

      const { data: jdResult, error: jdError } = await supabase
        .from('job_descriptions')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (jdError) {
        console.error('Supabase error updating job description:', jdError);
        throw new Error(`Database error: ${jdError.message}`);
      }

      if (!jdResult) {
        throw new Error('No data returned from job description update');
      }

      console.log('Job description updated successfully:', jdResult);

      // 2. Update responsibilities if provided
      if (data.responsibilities && data.responsibilities.length > 0) {
        console.log('Updating responsibilities:', data.responsibilities);
        
        // Delete existing responsibilities
        const { error: deleteRespError } = await supabase
          .from('jd_responsibilities')
          .delete()
          .eq('jd_id', id);

        if (deleteRespError) {
          console.error('Error deleting existing responsibilities:', deleteRespError);
        }

        // Insert new responsibilities
        const responsibilityInserts = data.responsibilities.map((resp, index) => ({
          jd_id: id,
          category: resp.category,
          description: resp.description,
          order_index: resp.order_index || index,
        }));

        const { error: respError } = await supabase
          .from('jd_responsibilities')
          .insert(responsibilityInserts);

        if (respError) {
          console.error('Error updating responsibilities:', respError);
          // Continue anyway, don't fail the whole operation
        }
      }

      // 3. Update risks if provided
      if (data.risks && data.risks.length > 0) {
        console.log('Updating risks:', data.risks);
        
        // Delete existing risks
        const { error: deleteRiskError } = await supabase
          .from('jd_risks')
          .delete()
          .eq('jd_id', id);

        if (deleteRiskError) {
          console.error('Error deleting existing risks:', deleteRiskError);
        }

        // Insert new risks
        const riskInserts = data.risks.map((risk, index) => ({
          jd_id: id,
          type: risk.type,
          description: risk.description,
          risk_level: risk.risk_level || 'medium',
          order_index: risk.order_index || index,
        }));

        const { error: riskError } = await supabase
          .from('jd_risks')
          .insert(riskInserts);

        if (riskError) {
          console.error('Error updating risks:', riskError);
          // Continue anyway, don't fail the whole operation
        }
      }

      // 4. Update competencies if provided
      if (data.competencies && data.competencies.length > 0) {
        console.log('Updating competencies:', data.competencies);
        
        // Delete existing competencies
        const { error: deleteCompError } = await supabase
          .from('jd_competencies')
          .delete()
          .eq('jd_id', id);

        if (deleteCompError) {
          console.error('Error deleting existing competencies:', deleteCompError);
        }

        // Insert new competencies
        const competencyInserts = data.competencies
          .filter(comp => comp.score > 0) // Only insert competencies with scores
          .map(comp => ({
            jd_id: id,
            competency_id: comp.competency_id,
            score: comp.score,
            notes: comp.notes || null,
          }));

        if (competencyInserts.length > 0) {
          const { error: compError } = await supabase
            .from('jd_competencies')
            .insert(competencyInserts);

          if (compError) {
            console.error('Error updating competencies:', compError);
            // Continue anyway, don't fail the whole operation
          }
        }
      }

      // 5. Return the updated job description
      return jdResult;
    } catch (error) {
      console.error('API Error in update job description:', error);
      throw error;
    }
  },

  // Patch job description (partial update)
  patch: async (id: string, data: Partial<JobDescriptionAPI>): Promise<JobDescriptionAPI> => {
    const { data: result, error } = await supabase
      .from('job_descriptions')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return result;
  },

  // Delete job description
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('job_descriptions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }
  },

  // Archive job description
  archive: async (id: string): Promise<JobDescriptionAPI> => {
    return jobDescriptionsAPI.patch(id, { status: 'archived' });
  },

  // Publish job description
  publish: async (id: string): Promise<JobDescriptionAPI> => {
    return jobDescriptionsAPI.patch(id, { status: 'published' });
  },
};

// Locations API
export const locationsAPI = {
  getAll: async (): Promise<Location[]> => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('order_index');

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return data || [];
  },

  create: async (locationData: { name: string; order_index: number }): Promise<Location> => {
    const { data, error } = await supabase
      .from('locations')
      .insert([locationData])
      .select('*')
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return data;
  },

  update: async (id: string, updates: { name?: string; order_index?: number }): Promise<Location> => {
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }
  },
};

// Departments API
export const departmentsAPI = {
  getAll: async (): Promise<Department[]> => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('order_index');

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return data || [];
  },

  create: async (departmentData: { name: string; order_index: number }): Promise<Department> => {
    const { data, error } = await supabase
      .from('departments')
      .insert([departmentData])
      .select('*')
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return data;
  },

  update: async (id: string, updates: { name?: string; order_index?: number }): Promise<Department> => {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }
  },
};

// Teams API
export const teamsAPI = {
  getAll: async (): Promise<Team[]> => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        department:departments(id, name)
      `)
      .order('order_index');

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return data || [];
  },

  getByDepartment: async (departmentId: string): Promise<Team[]> => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        department:departments(id, name)
      `)
      .eq('department_id', departmentId)
      .order('order_index');

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return data || [];
  },

  create: async (teamData: { name: string; department_id: string; order_index: number }): Promise<Team> => {
    const { data, error } = await supabase
      .from('teams')
      .insert([teamData])
      .select(`
        *,
        department:departments(id, name)
      `)
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return data;
  },

  update: async (id: string, updates: { name?: string; department_id?: string; order_index?: number }): Promise<Team> => {
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        department:departments(id, name)
      `)
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }
  },
};

// Competencies API
export const competenciesAPI = {
  getAll: async (): Promise<Competency[]> => {
    const { data, error } = await supabase
      .from('competencies')
      .select('*')
      .order('order_index');

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return data || [];
  },

  create: async (competencyData: { name: string; order_index: number }): Promise<Competency> => {
    const { data, error } = await supabase
      .from('competencies')
      .insert([competencyData])
      .select('*')
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return data;
  },

  update: async (id: string, updates: { name?: string; order_index?: number }): Promise<Competency> => {
    const { data, error } = await supabase
      .from('competencies')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('competencies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }
  },
};

// Users API
export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return data || [];
  },

  getById: async (id: string): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return data;
  },
};

export default { jobDescriptionsAPI, locationsAPI, departmentsAPI, teamsAPI, competenciesAPI, usersAPI };