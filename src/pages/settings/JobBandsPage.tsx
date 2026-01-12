import { useState } from 'react';
import { useJobBands } from '../../hooks/useJobBands';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import type { JobBandEntity } from '../../types';
import toast from 'react-hot-toast';

export const JobBandsPage = () => {
  const { jobBands, loading, createJobBand, updateJobBand, deleteJobBand } = useJobBands();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editOrder, setEditOrder] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newOrder, setNewOrder] = useState(0);

  const handleEdit = (band: JobBandEntity) => {
    setEditingId(band.id);
    setEditName(band.name);
    setEditOrder(band.order_index);
  };

  const handleSave = async (id: string) => {
    try {
      await updateJobBand(id, editName, editOrder);
      setEditingId(null);
      toast.success('Job band updated successfully!');
    } catch (error) {
      toast.error('Failed to update job band');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
    setEditOrder(0);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await createJobBand(newName, newOrder);
      setIsAdding(false);
      setNewName('');
      setNewOrder(jobBands.length + 1);
      toast.success('Job band created successfully!');
    } catch (error) {
      toast.error('Failed to create job band');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job band? This will also affect all associated job grades.')) {
      try {
        await deleteJobBand(id);
        toast.success('Job band deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete job band');
      }
    }
  };

  if (loading && jobBands.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-600">Job Bands</h1>
          <p className="text-primary-400 mt-1">Manage job band levels</p>
        </div>
        <Button
          onClick={() => {
            setIsAdding(true);
            setNewOrder(jobBands.length + 1);
          }}
          icon={<Plus className="w-5 h-5" />}
        >
          Add Job Band
        </Button>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary-50/50 border-b border-primary-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-primary-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-100">
            {isAdding && (
              <tr className="bg-accent-50/30">
                <td className="px-6 py-4">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., JB 6"
                    autoFocus
                  />
                </td>
                <td className="px-6 py-4">
                  <Input
                    type="number"
                    value={newOrder}
                    onChange={(e) => setNewOrder(parseInt(e.target.value))}
                    className="w-24"
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAdd}
                      icon={<Save className="w-4 h-4" />}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAdding(false);
                        setNewName('');
                      }}
                      icon={<X className="w-4 h-4" />}
                    >
                      Cancel
                    </Button>
                  </div>
                </td>
              </tr>
            )}
            {jobBands.map((band) => (
              <tr key={band.id} className="hover:bg-primary-50/30 transition-colors">
                {editingId === band.id ? (
                  <>
                    <td className="px-6 py-4">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        value={editOrder}
                        onChange={(e) => setEditOrder(parseInt(e.target.value))}
                        className="w-24"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSave(band.id)}
                          icon={<Save className="w-4 h-4" />}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancel}
                          icon={<X className="w-4 h-4" />}
                        >
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-primary-900">{band.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-primary-600">{band.order_index}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(band)}
                          icon={<Edit className="w-4 h-4" />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(band.id)}
                          icon={<Trash2 className="w-4 h-4" />}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
