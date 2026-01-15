import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface JobBandEntity {
  id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const useJobBands = () => {
  const [jobBands, setJobBands] = useState<JobBandEntity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobBands = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_bands')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setJobBands(data || []);
    } catch (error: any) {
      console.error('Error fetching job bands:', error);
      toast.error('ไม่สามารถโหลดข้อมูล Job Bands ได้');
    } finally {
      setLoading(false);
    }
  };

  const createJobBand = async (name: string, orderIndex: number) => {
    try {
      const { data, error } = await supabase
        .from('job_bands')
        .insert([{ name, order_index: orderIndex }])
        .select()
        .single();

      if (error) throw error;
      
      setJobBands(prev => [...prev, data].sort((a, b) => a.order_index - b.order_index));
      toast.success('เพิ่ม Job Band สำเร็จ');
      return data;
    } catch (error: any) {
      console.error('Error creating job band:', error);
      toast.error(error.message || 'ไม่สามารถเพิ่ม Job Band ได้');
      throw error;
    }
  };

  const updateJobBand = async (id: string, name: string, orderIndex: number) => {
    try {
      const { data, error } = await supabase
        .from('job_bands')
        .update({ name, order_index: orderIndex, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setJobBands(prev => 
        prev.map(band => band.id === id ? data : band).sort((a, b) => a.order_index - b.order_index)
      );
      toast.success('แก้ไข Job Band สำเร็จ');
      return data;
    } catch (error: any) {
      console.error('Error updating job band:', error);
      toast.error(error.message || 'ไม่สามารถแก้ไข Job Band ได้');
      throw error;
    }
  };

  const deleteJobBand = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_bands')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setJobBands(prev => prev.filter(band => band.id !== id));
      toast.success('ลบ Job Band สำเร็จ');
    } catch (error: any) {
      console.error('Error deleting job band:', error);
      toast.error(error.message || 'ไม่สามารถลบ Job Band ได้');
      throw error;
    }
  };

  useEffect(() => {
    fetchJobBands();
  }, []);

  return {
    jobBands,
    loading,
    fetchJobBands,
    createJobBand,
    updateJobBand,
    deleteJobBand,
  };
};
