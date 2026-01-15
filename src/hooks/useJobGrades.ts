import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface JobGradeEntity {
  id: string;
  name: string;
  job_band_id: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const useJobGrades = () => {
  const [jobGrades, setJobGrades] = useState<JobGradeEntity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobGrades = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_grades')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setJobGrades(data || []);
    } catch (error: any) {
      console.error('Error fetching job grades:', error);
      toast.error('ไม่สามารถโหลดข้อมูล Job Grades ได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobGradesByBand = async (bandId: string) => {
    return jobGrades.filter(g => g.job_band_id === bandId);
  };

  const createJobGrade = async (name: string, jobBandId: string, orderIndex: number) => {
    try {
      const { data, error } = await supabase
        .from('job_grades')
        .insert([{ name, job_band_id: jobBandId, order_index: orderIndex }])
        .select()
        .single();

      if (error) throw error;
      
      setJobGrades(prev => [...prev, data].sort((a, b) => {
        if (a.job_band_id === b.job_band_id) {
          return a.order_index - b.order_index;
        }
        return a.job_band_id.localeCompare(b.job_band_id);
      }));
      toast.success('เพิ่ม Job Grade สำเร็จ');
      return data;
    } catch (error: any) {
      console.error('Error creating job grade:', error);
      toast.error(error.message || 'ไม่สามารถเพิ่ม Job Grade ได้');
      throw error;
    }
  };

  const updateJobGrade = async (id: string, name: string, jobBandId: string, orderIndex: number) => {
    try {
      const { data, error } = await supabase
        .from('job_grades')
        .update({ name, job_band_id: jobBandId, order_index: orderIndex, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setJobGrades(prev => 
        prev.map(grade => grade.id === id ? data : grade).sort((a, b) => {
          if (a.job_band_id === b.job_band_id) {
            return a.order_index - b.order_index;
          }
          return a.job_band_id.localeCompare(b.job_band_id);
        })
      );
      toast.success('แก้ไข Job Grade สำเร็จ');
      return data;
    } catch (error: any) {
      console.error('Error updating job grade:', error);
      toast.error(error.message || 'ไม่สามารถแก้ไข Job Grade ได้');
      throw error;
    }
  };

  const deleteJobGrade = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_grades')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setJobGrades(prev => prev.filter(grade => grade.id !== id));
      toast.success('ลบ Job Grade สำเร็จ');
    } catch (error: any) {
      console.error('Error deleting job grade:', error);
      toast.error(error.message || 'ไม่สามารถลบ Job Grade ได้');
      throw error;
    }
  };

  useEffect(() => {
    fetchJobGrades();
  }, []);

  return {
    jobGrades,
    loading,
    fetchJobGrades,
    fetchJobGradesByBand,
    createJobGrade,
    updateJobGrade,
    deleteJobGrade,
  };
};
