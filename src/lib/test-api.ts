// Test API functions to debug connection issues
import { supabase } from './supabase';

export const testAPI = {
  // Test basic connection
  testConnection: async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('count(*)')
        .single();
      
      if (error) {
        console.error('Connection test failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Connection test successful:', data);
      return { success: true, data };
    } catch (error: any) {
      console.error('Connection test error:', error);
      return { success: false, error: error.message };
    }
  },

  // Test data availability
  testData: async () => {
    try {
      const results = await Promise.all([
        supabase.from('departments').select('*').limit(5),
        supabase.from('teams').select('*').limit(5),
        supabase.from('locations').select('*').limit(5),
        supabase.from('competencies').select('*').limit(5),
      ]);

      const [departments, teams, locations, competencies] = results;

      return {
        departments: { count: departments.data?.length || 0, error: departments.error },
        teams: { count: teams.data?.length || 0, error: teams.error },
        locations: { count: locations.data?.length || 0, error: locations.error },
        competencies: { count: competencies.data?.length || 0, error: competencies.error },
      };
    } catch (error: any) {
      console.error('Data test error:', error);
      return { error: error.message };
    }
  },

  // Test simple job description creation
  testCreateJD: async () => {
    try {
      // Get first available IDs
      const { data: locations } = await supabase.from('locations').select('id').limit(1);
      const { data: departments } = await supabase.from('departments').select('id').limit(1);
      const { data: teams } = await supabase.from('teams').select('id').limit(1);

      if (!locations?.length || !departments?.length || !teams?.length) {
        return { success: false, error: 'Missing required reference data' };
      }

      const testData = {
        position: 'Test Position',
        job_band: 'JB 1' as const,
        job_grade: 'JG 1.1 Staff' as const,
        location_id: locations[0].id,
        department_id: departments[0].id,
        team_id: teams[0].id,
        direct_supervisor: 'Test Supervisor',
        job_purpose: 'Test job purpose',
        status: 'draft' as const,
        created_by: '550e8400-e29b-41d4-a716-446655440000',
        updated_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      console.log('Testing job description creation with:', testData);

      const { data, error } = await supabase
        .from('job_descriptions')
        .insert([testData])
        .select('*')
        .single();

      if (error) {
        console.error('Test JD creation failed:', error);
        return { success: false, error: error.message };
      }

      console.log('Test JD created successfully:', data);
      
      // Clean up - delete the test record
      await supabase.from('job_descriptions').delete().eq('id', data.id);
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Test JD creation error:', error);
      return { success: false, error: error.message };
    }
  }
};

// Add to window for easy testing in console
if (typeof window !== 'undefined') {
  (window as any).testAPI = testAPI;
}