import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';
import toast from 'react-hot-toast';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          location:locations(id, name),
          department:departments(id, name),
          team:teams(id, name)
        `)
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: {
    email: string;
    password: string;
    fullName: string;
    role: 'admin' | 'manager' | 'viewer';
    jobGrade: string | null;
    locationId: string;
    departmentId: string;
    teamId: string;
  }) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Create user record in users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.fullName,
          role: userData.role,
          job_grade: userData.jobGrade,
          location_id: userData.locationId,
          department_id: userData.departmentId,
          team_id: userData.teamId,
        });

      if (userError) throw userError;

      toast.success('User created successfully');
      await loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const updateUser = async (
    userId: string,
    updates: {
      fullName?: string;
      role?: 'admin' | 'manager' | 'viewer';
      jobGrade?: string | null;
      locationId?: string;
      departmentId?: string;
      teamId?: string;
      isActive?: boolean;
    }
  ) => {
    try {
      const updateData: any = {};
      if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.jobGrade !== undefined) updateData.job_grade = updates.jobGrade;
      if (updates.locationId !== undefined) updateData.location_id = updates.locationId;
      if (updates.departmentId !== undefined) updateData.department_id = updates.departmentId;
      if (updates.teamId !== undefined) updateData.team_id = updates.teamId;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      toast.success('User updated successfully');
      await loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User deactivated successfully');
      await loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const resetPassword = async (_userId: string, _newPassword: string) => {
    try {
      // This would typically be done via admin API
      // For now, we'll show a message
      toast('Password reset functionality requires admin API access');
      // In production, you would use Supabase Admin API:
      // const { data, error } = await supabase.auth.admin.updateUserById(
      //   userId,
      //   { password: newPassword }
      // );
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  return {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    reload: loadUsers,
  };
};
