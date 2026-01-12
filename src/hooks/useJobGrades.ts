import { useState, useMemo, useEffect } from 'react';
import type { JobGradeEntity } from '../types';

// Hardcoded job grades data (rarely changes)
const DEFAULT_JOB_GRADES: JobGradeEntity[] = [
  // JB 1 grades
  { id: 'jg-1-1', name: 'JG 1.1', job_band_id: 'jb-1', order_index: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'jg-1-2', name: 'JG 1.2', job_band_id: 'jb-1', order_index: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'jg-1-3', name: 'JG 1.3', job_band_id: 'jb-1', order_index: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // JB 2 grades
  { id: 'jg-2-1', name: 'JG 2.1', job_band_id: 'jb-2', order_index: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'jg-2-2', name: 'JG 2.2', job_band_id: 'jb-2', order_index: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'jg-2-3', name: 'JG 2.3', job_band_id: 'jb-2', order_index: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // JB 3 grades
  { id: 'jg-3-1', name: 'JG 3.1', job_band_id: 'jb-3', order_index: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'jg-3-2', name: 'JG 3.2', job_band_id: 'jb-3', order_index: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'jg-3-3', name: 'JG 3.3', job_band_id: 'jb-3', order_index: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // JB 4 grades
  { id: 'jg-4-1', name: 'JG 4.1', job_band_id: 'jb-4', order_index: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'jg-4-2', name: 'JG 4.2', job_band_id: 'jb-4', order_index: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'jg-4-3', name: 'JG 4.3', job_band_id: 'jb-4', order_index: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // JB 5 grades
  { id: 'jg-5-1', name: 'JG 5.1', job_band_id: 'jb-5', order_index: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'jg-5-2', name: 'JG 5.2', job_band_id: 'jb-5', order_index: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'jg-5-3', name: 'JG 5.3', job_band_id: 'jb-5', order_index: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const STORAGE_KEY = 'jd_job_grades';

// Load from localStorage or use defaults
const loadJobGrades = (): JobGradeEntity[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load job grades from localStorage:', error);
  }
  return DEFAULT_JOB_GRADES;
};

// Save to localStorage
const saveJobGrades = (grades: JobGradeEntity[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(grades));
  } catch (error) {
    console.error('Failed to save job grades to localStorage:', error);
  }
};

export const useJobGrades = () => {
  const [jobGrades, setJobGrades] = useState<JobGradeEntity[]>(loadJobGrades);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Save to localStorage whenever jobGrades changes
  useEffect(() => {
    saveJobGrades(jobGrades);
  }, [jobGrades]);

  const fetchJobGrades = async () => {
    // Reload from localStorage
    setJobGrades(loadJobGrades());
    return Promise.resolve();
  };

  const fetchJobGradesByBand = async (bandId: string) => {
    return jobGrades.filter(g => g.job_band_id === bandId);
  };

  const createJobGrade = async (name: string, jobBandId: string, orderIndex: number) => {
    const newGrade: JobGradeEntity = {
      id: `jg-${Date.now()}`,
      name,
      job_band_id: jobBandId,
      order_index: orderIndex,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setJobGrades(prev => {
      const updated = [...prev, newGrade].sort((a, b) => {
        if (a.job_band_id === b.job_band_id) {
          return a.order_index - b.order_index;
        }
        return a.job_band_id.localeCompare(b.job_band_id);
      });
      saveJobGrades(updated);
      return updated;
    });
    return newGrade;
  };

  const updateJobGrade = async (id: string, name: string, jobBandId: string, orderIndex: number) => {
    const updatedGrade = jobGrades.find(g => g.id === id);
    if (!updatedGrade) throw new Error('Job grade not found');
    
    const updated = { ...updatedGrade, name, job_band_id: jobBandId, order_index: orderIndex, updated_at: new Date().toISOString() };
    setJobGrades(prev => {
      const result = prev.map(grade => grade.id === id ? updated : grade).sort((a, b) => {
        if (a.job_band_id === b.job_band_id) {
          return a.order_index - b.order_index;
        }
        return a.job_band_id.localeCompare(b.job_band_id);
      });
      saveJobGrades(result);
      return result;
    });
    return updated;
  };

  const deleteJobGrade = async (id: string) => {
    setJobGrades(prev => {
      const result = prev.filter(grade => grade.id !== id);
      saveJobGrades(result);
      return result;
    });
  };

  return {
    jobGrades: useMemo(() => jobGrades, [jobGrades]),
    loading,
    error,
    fetchJobGrades,
    fetchJobGradesByBand,
    createJobGrade,
    updateJobGrade,
    deleteJobGrade,
  };
};
