import { useState, useRef } from 'react';
import { useJobPositions } from '../../hooks/useJobPositions';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Edit2, Trash2, Briefcase, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export const JobPositionsPage = () => {
  const { positions, loading, addPosition, updatePosition, deletePosition, bulkImport } = useJobPositions();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error('Position name is required');
      return;
    }

    try {
      await addPosition(newName.trim(), newDescription.trim() || undefined);
      setNewName('');
      setNewDescription('');
      setIsAdding(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUpdate = async (id: string) => {
    if (!newName.trim()) {
      toast.error('Position name is required');
      return;
    }

    try {
      await updatePosition(id, newName.trim(), newDescription.trim() || undefined);
      setEditingId(null);
      setNewName('');
      setNewDescription('');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePosition(id);
      setDeleteConfirm(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const startEdit = (id: string, name: string, description?: string) => {
    setEditingId(id);
    setNewName(name);
    setNewDescription(description || '');
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setNewName('');
    setNewDescription('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Parse CSV: name,description
        const positionsToImport = lines.slice(1).map(line => {
          const [name, description] = line.split(',').map(s => s.trim());
          return { name, description };
        }).filter(pos => pos.name);

        if (positionsToImport.length === 0) {
          toast.error('No valid positions found in file');
          return;
        }

        await bulkImport(positionsToImport);
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error('Failed to parse file. Please use CSV format: name,description');
      }
    };

    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const csv = 'name,description\nSenior Manager,Senior management position\nProject Manager,Project management position';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'job_positions_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
          <h1 className="text-heading-1 font-semibold text-primary-600">Job Positions</h1>
          <p className="text-body text-primary-400 mt-1">
            Manage job position titles used in job descriptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={downloadTemplate}
            icon={<Download className="w-5 h-5" />}
          >
            Template
          </Button>
          <Button
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-5 h-5" />}
          >
            Import CSV
          </Button>
          <Button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setNewName('');
              setNewDescription('');
            }}
            icon={<Plus className="w-5 h-5" />}
          >
            Add Position
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <h3 className="text-body-lg font-semibold text-primary-600 mb-4">
            {isAdding ? 'Add New Position' : 'Edit Position'}
          </h3>
          <div className="space-y-4">
            <Input
              label="Position Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Senior Manager, Developer"
              required
            />
            <div>
              <label className="block text-sm font-medium text-primary-600 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Brief description of the position"
                rows={3}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => (isAdding ? handleAdd() : handleUpdate(editingId!))}
              >
                {isAdding ? 'Add Position' : 'Update Position'}
              </Button>
              <Button variant="ghost" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Positions List */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-50/50 border-b border-primary-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                  Position Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-primary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <Briefcase className="w-12 h-12 text-primary-300 mx-auto mb-3" />
                    <p className="text-body text-primary-400">No job positions yet</p>
                    <p className="text-body-sm text-primary-300 mt-1">
                      Click "Add Position" to create your first position
                    </p>
                  </td>
                </tr>
              ) : (
                positions.map((position) => (
                  <tr key={position.id} className="hover:bg-primary-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary-400" />
                        <span className="text-body font-medium text-primary-600">
                          {position.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-body text-primary-500">
                        {position.description || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(position.id, position.name, position.description)}
                          icon={<Edit2 className="w-4 h-4" />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(position.id)}
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
              <h3 className="text-lg font-semibold text-gray-900">Delete Position</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this position? This action cannot be undone.
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
