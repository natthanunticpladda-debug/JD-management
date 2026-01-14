import { useState } from 'react';
import { useCompanyAssets } from '../../hooks/useCompanyAssets';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyAssetsPage = () => {
  const { assets, loading, addAsset, updateAsset, deleteAsset } = useCompanyAssets();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) {
      toast.error('Asset name is required');
      return;
    }

    addAsset(newName.trim());
    setNewName('');
    setIsAdding(false);
    toast.success('Company asset added successfully');
  };

  const handleUpdate = (id: string) => {
    if (!newName.trim()) {
      toast.error('Asset name is required');
      return;
    }

    updateAsset(id, newName.trim());
    setEditingId(null);
    setNewName('');
    toast.success('Company asset updated successfully');
  };

  const handleDelete = (id: string) => {
    deleteAsset(id);
    setDeleteConfirm(null);
    toast.success('Company asset deleted successfully');
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setNewName(name);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setNewName('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-1 font-semibold text-primary-600">Company Assets</h1>
          <p className="text-body text-primary-400 mt-1">
            Manage company assets that can be assigned to positions
          </p>
        </div>
        <Button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setNewName('');
          }}
          icon={<Plus className="w-5 h-5" />}
        >
          Add Asset
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <h3 className="text-body-lg font-semibold text-primary-600 mb-4">
            {isAdding ? 'Add New Asset' : 'Edit Asset'}
          </h3>
          <div className="space-y-4">
            <Input
              label="Asset Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Laptop, Mobile Phone"
              required
            />
            <div className="flex gap-2">
              <Button
                onClick={() => (isAdding ? handleAdd() : handleUpdate(editingId!))}
              >
                {isAdding ? 'Add Asset' : 'Update Asset'}
              </Button>
              <Button variant="ghost" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assets List */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-50/50 border-b border-primary-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                  Asset Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-primary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-primary-300 mx-auto mb-3" />
                    <p className="text-body text-primary-400">No company assets yet</p>
                    <p className="text-body-sm text-primary-300 mt-1">
                      Click "Add Asset" to create your first asset
                    </p>
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-primary-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary-400" />
                        <span className="text-body font-medium text-primary-600">
                          {asset.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(asset.id, asset.name)}
                          icon={<Edit2 className="w-4 h-4" />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(asset.id)}
                          icon={<Trash2 className="w-4 h-4" />}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Asset</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this asset? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
