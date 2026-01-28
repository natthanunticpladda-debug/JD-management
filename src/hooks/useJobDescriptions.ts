import { useState, useEffect, useCallback } from 'react';
import { jobDescriptionsAPI } from '../lib/api';
import type {
  JobDescriptionAPI,
  CreateJobDescriptionData,
  UpdateJobDescriptionData,
  JobDescriptionFilters
} from '../types';
import toast from 'react-hot-toast';
import { logActivity } from './useActivityLogs';

export const useJobDescriptions = () => {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescriptionAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all job descriptions
  const fetchJobDescriptions = useCallback(async (filters?: JobDescriptionFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobDescriptionsAPI.getAll(filters);
      setJobDescriptions(data);
    } catch (err) {
      const errorMessage = 'Failed to fetch job descriptions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get job description by ID
  const getJobDescription = async (id: string): Promise<JobDescriptionAPI | null> => {
    console.log('=== getJobDescription called ===');
    console.log('ID:', id);
    setLoading(true);
    setError(null);
    try {
      console.log('Calling API...');
      const data = await jobDescriptionsAPI.getById(id);
      console.log('API returned:', data);
      return data;
    } catch (err) {
      console.error('=== getJobDescription ERROR ===');
      console.error('Error:', err);
      const errorMessage = 'Failed to fetch job description';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      console.log('=== getJobDescription finished ===');
      setLoading(false);
    }
  };

  // Create job description
  const createJobDescription = async (data: CreateJobDescriptionData): Promise<JobDescriptionAPI> => {
    setLoading(true);
    setError(null);
    try {
      const newJD = await jobDescriptionsAPI.create(data);
      setJobDescriptions(prev => [...prev, newJD]);
      toast.success('Job description created successfully!');

      // Log activity
      await logActivity(
        data.created_by,
        'create',
        'job_description',
        newJD.id,
        `สร้าง Job Description: ${newJD.position}`,
        { position: newJD.position, job_grade: newJD.job_grade, status: newJD.status }
      );

      return newJD;
    } catch (err) {
      const errorMessage = 'Failed to create job description';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update job description
  const updateJobDescription = async (id: string, data: UpdateJobDescriptionData): Promise<JobDescriptionAPI> => {
    setLoading(true);
    setError(null);
    try {
      console.log('=== Updating Job Description ===');
      console.log('ID:', id);
      console.log('Data:', data);

      const updatedJD = await jobDescriptionsAPI.update(id, data);

      console.log('Update successful:', updatedJD);
      setJobDescriptions(prev =>
        prev.map(jd => jd.id === id ? updatedJD : jd)
      );
      toast.success('Job description updated successfully!');

      // Log activity
      if (data.updated_by) {
        await logActivity(
          data.updated_by,
          'update',
          'job_description',
          id,
          `แก้ไข Job Description: ${updatedJD.position}`,
          { position: updatedJD.position, changes: Object.keys(data) }
        );
      }

      return updatedJD;
    } catch (err: any) {
      console.error('=== Update Error ===');
      console.error('Error object:', err);
      console.error('Error message:', err?.message);
      console.error('Error details:', err?.details);
      console.error('Error hint:', err?.hint);

      const errorMessage = err?.message || 'Failed to update job description';
      setError(errorMessage);
      toast.error(`Update failed: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete job description
  const deleteJobDescription = async (id: string, userId?: string, position?: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await jobDescriptionsAPI.delete(id);
      setJobDescriptions(prev => prev.filter(jd => jd.id !== id));
      toast.success('Job description deleted successfully!');

      // Log activity
      if (userId) {
        await logActivity(
          userId,
          'delete',
          'job_description',
          id,
          `ลบ Job Description: ${position || 'Unknown'}`,
          { position }
        );
      }
    } catch (err) {
      const errorMessage = 'Failed to delete job description';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Archive job description
  const archiveJobDescription = async (id: string, userId?: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const archivedJD = await jobDescriptionsAPI.archive(id);
      setJobDescriptions(prev =>
        prev.map(jd => jd.id === id ? archivedJD : jd)
      );
      toast.success('Job description archived successfully!');

      // Log activity
      if (userId) {
        await logActivity(
          userId,
          'archive',
          'job_description',
          id,
          `Archive Job Description: ${archivedJD.position}`,
          { position: archivedJD.position }
        );
      }
    } catch (err) {
      const errorMessage = 'Failed to archive job description';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Publish job description
  const publishJobDescription = async (id: string, userId?: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const publishedJD = await jobDescriptionsAPI.publish(id);
      setJobDescriptions(prev =>
        prev.map(jd => jd.id === id ? publishedJD : jd)
      );
      toast.success('Job description published successfully!');

      // Log activity
      if (userId) {
        await logActivity(
          userId,
          'publish',
          'job_description',
          id,
          `เผยแพร่ Job Description: ${publishedJD.position}`,
          { position: publishedJD.position, job_grade: publishedJD.job_grade }
        );
      }
    } catch (err) {
      const errorMessage = 'Failed to publish job description';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load job descriptions on mount
  useEffect(() => {
    fetchJobDescriptions();
  }, [fetchJobDescriptions]);

  return {
    jobDescriptions,
    loading,
    error,
    fetchJobDescriptions,
    getJobDescription,
    createJobDescription,
    updateJobDescription,
    deleteJobDescription,
    archiveJobDescription,
    publishJobDescription,
    refetch: fetchJobDescriptions,
  };
};