import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';
import toast from 'react-hot-toast';
import { logActivity } from './useActivityLogs';

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
          id,
          email,
          full_name,
          role,
          job_grade,
          team_id,
          location_id,
          department_id,
          is_active,
          created_at,
          updated_at,
          location:location_id(id, name),
          department:department_id(id, name),
          team:team_id(id, name)
        `)
        .order('full_name');

      if (error) {
        console.error('Error loading users:', error);
        // If job_grade column doesn't exist, try without it
        if (error.message.includes('job_grade')) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('users')
            .select(`
              id,
              email,
              full_name,
              role,
              team_id,
              location_id,
              department_id,
              is_active,
              created_at,
              updated_at,
              location:location_id(id, name),
              department:department_id(id, name),
              team:team_id(id, name)
            `)
            .order('full_name');

          if (fallbackError) throw fallbackError;
          // Add job_grade: null to all users
          // Supabase returns arrays for foreign keys, need to extract first item
          setUsers((fallbackData || []).map(user => ({
            ...user,
            job_grade: null,
            location: Array.isArray(user.location) && user.location.length > 0 ? user.location[0] : user.location,
            department: Array.isArray(user.department) && user.department.length > 0 ? user.department[0] : user.department,
            team: Array.isArray(user.team) && user.team.length > 0 ? user.team[0] : user.team,
          })) as User[]);
          toast.error('Please run SQL migration to add job_grade column');
          return;
        }
        throw error;
      }
      // Supabase returns arrays for foreign keys, need to extract first item
      setUsers((data || []).map(user => ({
        ...user,
        location: Array.isArray(user.location) && user.location.length > 0 ? user.location[0] : user.location,
        department: Array.isArray(user.department) && user.department.length > 0 ? user.department[0] : user.department,
        team: Array.isArray(user.team) && user.team.length > 0 ? user.team[0] : user.team,
      })) as User[]);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: {
    email: string;
    fullName: string;
    role: 'admin' | 'manager' | 'viewer';
    jobGrade: string | null;
    locationId: string;
    departmentId: string;
    teamId: string;
  }, adminUserId?: string) => {
    try {
      const newUserId = crypto.randomUUID();
      // Pre-register user in users table
      // User will be linked to auth when they first login via Microsoft
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: newUserId, // Generate UUID, will be updated when user logs in via Microsoft
          email: userData.email,
          full_name: userData.fullName,
          role: userData.role,
          job_grade: userData.jobGrade,
          location_id: userData.locationId,
          department_id: userData.departmentId,
          team_id: userData.teamId,
          is_active: true,
        });

      if (userError) throw userError;

      toast.success('User created successfully. They can now login with Microsoft.');

      // Log activity
      if (adminUserId) {
        await logActivity(
          adminUserId,
          'create',
          'user',
          newUserId,
          `สร้างผู้ใช้ใหม่: ${userData.fullName} (${userData.email})`,
          { email: userData.email, fullName: userData.fullName, role: userData.role }
        );
      }

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
      additionalTeamIds?: string[];
    },
    adminUserId?: string,
    targetUserName?: string
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

      // Handle additional teams for managers
      if (updates.additionalTeamIds !== undefined) {
        // Delete existing additional teams
        await supabase
          .from('user_teams')
          .delete()
          .eq('user_id', userId);

        // Insert new additional teams (excluding primary team)
        if (updates.additionalTeamIds.length > 0) {
          const teamInserts = updates.additionalTeamIds
            .filter(teamId => teamId !== updates.teamId) // Exclude primary team
            .map(teamId => ({
              user_id: userId,
              team_id: teamId,
            }));

          if (teamInserts.length > 0) {
            const { error: teamError } = await supabase
              .from('user_teams')
              .insert(teamInserts);

            if (teamError) {
              console.error('Error updating additional teams:', teamError);
              // Don't throw - user update succeeded
            }
          }
        }
      }

      toast.success('User updated successfully');

      // Log activity
      if (adminUserId) {
        // Determine activity action based on updates
        let action: 'update' | 'role_change' | 'team_assign' = 'update';
        let description = `แก้ไขข้อมูลผู้ใช้: ${targetUserName || userId}`;

        if (updates.role !== undefined) {
          action = 'role_change';
          description = `เปลี่ยน Role ผู้ใช้ ${targetUserName || userId} เป็น ${updates.role}`;
        } else if (updates.teamId !== undefined || updates.additionalTeamIds !== undefined) {
          action = 'team_assign';
          description = `กำหนด Team ให้ผู้ใช้: ${targetUserName || userId}`;
        }

        await logActivity(
          adminUserId,
          action,
          'user',
          userId,
          description,
          { changes: Object.keys(updates), ...updates }
        );
      }

      await loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string, adminUserId?: string, targetUserName?: string) => {
    try {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User deactivated successfully');

      // Log activity
      if (adminUserId) {
        await logActivity(
          adminUserId,
          'user_delete',
          'user',
          userId,
          `ปิดการใช้งานผู้ใช้: ${targetUserName || userId}`,
          { deactivatedUser: targetUserName || userId }
        );
      }

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

  const getUserAdditionalTeams = async (userId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('user_teams')
        .select('team_id')
        .eq('user_id', userId);

      if (error) {
        console.error('Error loading additional teams:', error);
        return [];
      }

      return (data || []).map(d => d.team_id);
    } catch (error) {
      console.error('Error loading additional teams:', error);
      return [];
    }
  };

  return {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    getUserAdditionalTeams,
    reload: loadUsers,
  };
};
