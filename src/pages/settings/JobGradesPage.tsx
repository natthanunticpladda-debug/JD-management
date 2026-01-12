import { useState } from 'react';
import { useJobGrades } from '../../hooks/useJobGrades';
import { useJobBands } from '../../hooks/useJobBands';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import type { JobGradeEntity } from '../../types';
import toast from 'react-hot-toast';

export const JobGradesPage = () => {
  const { jobGrades, loading, createJobGrade, updateJobGrade, deleteJobGrade } = useJobGrades();
  const { jobBands } = useJobBands();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBandId, setEditBandId] = useState('');
  const [editOrder, setEditOrder] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBandId, setNewBandId] = useState('');
  const [newOrder, setNewOrder] = useState(0);

  const handleEdit = (grade: JobGradeEntity) => {
    setEditingId(grade.id);
    setEditName(grade.name);
    setEditBandId(grade.job_band_id);
    setEditOrder(grade.order_index);
  };

  const handleSave = async (id: string) => {
    try {
      await updateJobGrade(id, editName, editBandId, editOrder);
      setEditingId(null);
      toast.success('Job grade updated successfully!');
    } catch (error) {
      toast.error('Failed to update job grade');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
    setEditBandId('');
    setEditOrder(0);
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newBandId) return;
    try {
      await createJobGrade(newName, newBandId, newOrder);
      setIsAdding(false);
      setNewName('');
      setNewBandId('');
      setNewOrder(jobGrades.length + 1);
      toast.success('Job grade created successfully!');
    } catch (error) {
      toast.error('Failed to create job grade');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job grade?')) {
      try {
        await deleteJobGrade(id);
        toast.success('Job grade deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete job grade');
      }
    }
  };

  const getBandName = (bandId: string) => {
    return jobBands.find(b => b.id === bandId)?.name || 'Unknown';
  };

  if (loading && jobGrades.length === 0) {
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
          <h1 className="text-3xl font-bold text-primary-600">Job Grades</h1>
          <p className="text-primary-400 mt-1">Manage job grade levels within bands</p>
        </div>
        <Button
          onClick={() => {
            setIsAdding(true);
            setNewOrder(jobGrades.length + 1);
          }}
          icon={<Plus className="w-5 h-5" />}
        >
          Add Job Grade
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
                Job Band
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
                    placeholder="e.g., JG 1.1"
                    autoFocus
                  />
                </td>
                <td className="px-6 py-4">
                  <Select
                    value={newBandId}
                    onChange={(e) => setNewBandId(e.target.value)}
                  >
                    <option value="">Select Job Band</option>
                    {jobBands.map((band) => (
                      <option key={band.id} value={band.id}>
                        {band.name}
                      </option>
                    ))}
                  </Select>
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
                        setNewBandId('');
                      }}
                      icon={<X className="w-4 h-4" />}
                    >
                      Cancel
                    </Button>
                  </div>
                </td>
              </tr>
            )}
            {jobGrades.map((grade) => (
              <tr key={grade.id} className="hover:bg-primary-50/30 transition-colors">
                {editingId === grade.id ? (
                  <>
                    <td className="px-6 py-4">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        value={editBandId}
                        onChange={(e) => setEditBandId(e.target.value)}
                      >
                        <option value="">Select Job Band</option>
                        {jobBands.map((band) => (
                          <option key={band.id} value={band.id}>
                            {band.name}
                          </option>
                        ))}
                      </Select>
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
                          onClick={() => handleSave(grade.id)}
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
                      <span className="text-sm font-medium text-primary-900">{grade.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-primary-600">{getBandName(grade.job_band_id)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-primary-600">{grade.order_index}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(grade)}
                          icon={<Edit className="w-4 h-4" />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(grade.id)}
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
