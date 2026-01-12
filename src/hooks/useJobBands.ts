import { useState, useMemo, useEffect } from 'react';
import type { JobBandEntity } from '../types';

// Hardcoded job bands data (rarely changes)
const DEFAULT_JOB_BANDS: JobBandEntity[] = [
  { id: 'jb-1', name: 'JB 1', order_index: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'jb-2', name: 'JB 2', order_index: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'jb-3', name: 'JB 3', order_index: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'jb-4', name: 'JB 4', order_index: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'jb-5', name: 'JB 5', order_index: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const STORAGE_KEY = 'jd_job_bands';

// Load from localStorage or use defaults
const loadJobBands = (): JobBandEntity[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load job bands from localStorage:', error);
  }
  return DEFAULT_JOB_BANDS;
};

// Save to localStorage
const saveJobBands = (bands: JobBandEntity[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bands));
  } catch (error) {
    console.error('Failed to save job bands to localStorage:', error);
  }
};

export const useJobBands = () => {
  const [jobBands, setJobBands] = useState<JobBandEntity[]>(loadJobBands);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Save to localStorage whenever jobBands changes
  useEffect(() => {
    saveJobBands(jobBands);
  }, [jobBands]);

  const fetchJobBands = async () => {
    // Reload from localStorage
    setJobBands(loadJobBands());
    return Promise.resolve();
  };

  const createJobBand = async (name: string, orderIndex: number) => {
    const newBand: JobBandEntity = {
      id: `jb-${Date.now()}`,
      name,
      order_index: orderIndex,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setJobBands(prev => {
      const updated = [...prev, newBand].sort((a, b) => a.order_index - b.order_index);
      saveJobBands(updated);
      return updated;
    });
    return newBand;
  };

  const updateJobBand = async (id: string, name: string, orderIndex: number) => {
    const updatedBand = jobBands.find(b => b.id === id);
    if (!updatedBand) throw new Error('Job band not found');
    
    const updated = { ...updatedBand, name, order_index: orderIndex, updated_at: new Date().toISOString() };
    setJobBands(prev => {
      const result = prev.map(band => band.id === id ? updated : band).sort((a, b) => a.order_index - b.order_index);
      saveJobBands(result);
      return result;
    });
    return updated;
  };

  const deleteJobBand = async (id: string) => {
    setJobBands(prev => {
      const result = prev.filter(band => band.id !== id);
      saveJobBands(result);
      return result;
    });
  };

  return {
    jobBands: useMemo(() => jobBands, [jobBands]),
    loading,
    error,
    fetchJobBands,
    createJobBand,
    updateJobBand,
    deleteJobBand,
  };
};
