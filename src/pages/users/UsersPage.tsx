import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers } from '../../hooks/useUsers';
import { useLocations } from '../../hooks/useLocations';
import { useDepartments } from '../../hooks/useDepartments';
import { useTeams } from '../../hooks/useTeams';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  UserCheck,
  UserX,
  Shield,
  Users as UsersIcon,
} from 'lucide-react';
import type { User } from '../../types';
import toast from 'react-hot-toast';

type UserFormData = {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'manager' | 'viewer';
  locationId: string;
  departmentId: string;
  teamId: string;
};

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const { users, loading, createUser, updateUser, deleteUser } = useUsers();
  const { locations } = useLocations();
  const { departments } = useDepartments();
  const { teams } = useTeams();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'viewer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    fullName: '',
    role: 'viewer',
    locationId: '',
    departmentId: '',
    teamId: '',
  });

  const isAdmin = currentUser?.role === 'admin';

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter !== 'all' && user.role !== roleFilter) return false;

    if (statusFilter === 'active' && !user.is_active) return false;
    if (statusFilter === 'inactive' && user.is_active) return false;

    return true;
  });

  const filteredTeams = teams.filter((t) => t.department_id === formData.departmentId);

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      role: 'viewer',
      locationId: '',
      departmentId: '',
      teamId: '',
    });
  };

  const handleCreate = async () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.locationId || !formData.departmentId || !formData.teamId) {
      toast.error('Please select location, department, and team');
      return;
    }

    setSubmitting(true);
    try {
      await createUser({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        locationId: formData.locationId,
        departmentId: formData.departmentId,
        teamId: formData.teamId,
      });
      setShowCreateModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      fullName: user.full_name,
      role: user.role,
      locationId: user.location_id,
      departmentId: user.department_id,
      teamId: user.team_id || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    if (!formData.fullName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.locationId || !formData.departmentId || !formData.teamId) {
      toast.error('Please select location, department, and team');
      return;
    }

    setSubmitting(true);
    try {
      await updateUser(selectedUser.id, {
        fullName: formData.fullName,
        role: formData.role,
        locationId: formData.locationId,
        departmentId: formData.departmentId,
        teamId: formData.teamId,
      });
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setSubmitting(true);
    try {
      await deleteUser(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await updateUser(user.id, { isActive: !user.is_active });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-red-100 text-red-600',
      manager: 'bg-blue-100 text-blue-600',
      viewer: 'bg-gray-100 text-gray-600',
    };

    const icons = {
      admin: <Shield className="w-3 h-3" />,
      manager: <UsersIcon className="w-3 h-3" />,
      viewer: <UserCheck className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-caption font-medium ${styles[role as keyof typeof styles]}`}>
        {icons[role as keyof typeof icons]}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <Shield className="w-16 h-16 text-primary-300 mx-auto mb-4" />
        <h2 className="text-heading-2 font-semibold text-primary-600 mb-2">Access Denied</h2>
        <p className="text-body text-primary-400">
          You don't have permission to access user management.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-heading-1 font-semibold text-primary-600">User Management</h1>
          <p className="text-body text-primary-400 mt-2">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} icon={<Plus className="w-5 h-5" />}>
          Create User
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="viewer">Viewer</option>
          </Select>

          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </div>

      {/* User List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100">
          <UsersIcon className="w-16 h-16 text-primary-300 mx-auto mb-4" />
          <p className="text-body text-primary-400 mb-4">
            {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'No users match your filters.'
              : 'No users found.'}
          </p>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-6 py-4 text-left text-caption font-semibold text-primary-600">
                  User
                </th>
                <th className="px-6 py-4 text-left text-caption font-semibold text-primary-600">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-caption font-semibold text-primary-600">
                  Organization
                </th>
                <th className="px-6 py-4 text-left text-caption font-semibold text-primary-600">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-caption font-semibold text-primary-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/40 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-body-sm font-medium text-primary-600">
                        {user.full_name}
                      </p>
                      <p className="text-caption text-primary-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4">
                    <div className="text-body-sm text-primary-500">
                      <p>{user.team?.name || 'N/A'}</p>
                      <p className="text-caption text-primary-400">
                        {user.department?.name} • {user.location?.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-caption font-medium bg-green-100 text-green-600">
                        <UserCheck className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-caption font-medium bg-gray-100 text-gray-600">
                        <UserX className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        icon={<Edit2 className="w-4 h-4" />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(user)}
                        icon={user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      {currentUser?.id !== user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(user)}
                          icon={<Trash2 className="w-4 h-4" />}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-primary-200">
              <h2 className="text-body-lg font-semibold text-primary-600">Create New User</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  required
                />
                <Select
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  required
                >
                  <option value="viewer">Viewer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </Select>
                <Select
                  label="Location"
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Department"
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value, teamId: '' })
                  }
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Team"
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  disabled={!formData.departmentId}
                  required
                >
                  <option value="">Select Team</option>
                  {filteredTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="p-6 border-t border-primary-200 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} loading={submitting}>
                Create User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-primary-200">
              <h2 className="text-body-lg font-semibold text-primary-600">Edit User</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
                <Input label="Email" value={formData.email} disabled />
                <Select
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  required
                >
                  <option value="viewer">Viewer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </Select>
                <Select
                  label="Location"
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Department"
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value, teamId: '' })
                  }
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Team"
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  disabled={!formData.departmentId}
                  required
                >
                  <option value="">Select Team</option>
                  {filteredTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="p-6 border-t border-primary-200 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} loading={submitting}>
                Update User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Deactivate User"
        message={`Are you sure you want to deactivate "${deleteConfirm?.full_name}"? They will no longer be able to access the system.`}
        confirmText="Deactivate"
        danger
        loading={submitting}
      />
    </div>
  );
};