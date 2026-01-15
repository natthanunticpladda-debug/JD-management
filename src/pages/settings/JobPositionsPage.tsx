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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error('กรุณากรอกชื่อตำแหน่งงาน');
      return;
    }

    try {
      await addPosition(newName.trim());
      setNewName('');
      setIsAdding(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUpdate = async (id: string) => {
    if (!newName.trim()) {
      toast.error('กรุณากรอกชื่อตำแหน่งงาน');
      return;
    }

    try {
      await updatePosition(id, newName.trim());
      setEditingId(null);
      setNewName('');
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Parse CSV: just position names, one per line
        const positionsToImport = lines.slice(1).map(line => {
          const name = line.trim();
          return { name };
        }).filter(pos => pos.name);

        if (positionsToImport.length === 0) {
          toast.error('ไม่พบข้อมูลตำแหน่งงานที่ถูกต้องในไฟล์');
          return;
        }

        await bulkImport(positionsToImport);
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error('ไม่สามารถอ่านไฟล์ได้ กรุณาใช้รูปแบบ CSV: ชื่อตำแหน่งงาน (หนึ่งตำแหน่งต่อบรรทัด)');
      }
    };

    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const csv = 'name\nSenior Manager\nProject Manager\nTechnical Lead';
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
            ดาวน์โหลดตัวอย่าง
          </Button>
          <Button
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-5 h-5" />}
          >
            นำเข้าจาก CSV
          </Button>
          <Button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setNewName('');
            }}
            icon={<Plus className="w-5 h-5" />}
          >
            เพิ่มตำแหน่งงาน
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
        <div key={editingId || 'new'} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <h3 className="text-body-lg font-semibold text-primary-600 mb-4">
            {isAdding ? 'เพิ่มตำแหน่งงานใหม่' : 'แก้ไขตำแหน่งงาน'}
          </h3>
          <div className="space-y-4">
            <Input
              label="ชื่อตำแหน่งงาน"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="เช่น Senior Manager, Developer"
              required
            />
            <div className="flex gap-2">
              <Button
                onClick={() => (isAdding ? handleAdd() : handleUpdate(editingId!))}
              >
                {isAdding ? 'เพิ่มตำแหน่งงาน' : 'บันทึกการแก้ไข'}
              </Button>
              <Button variant="ghost" onClick={cancelEdit}>
                ยกเลิก
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
                  ชื่อตำแหน่งงาน
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-primary-500 uppercase tracking-wider">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center">
                    <Briefcase className="w-12 h-12 text-primary-300 mx-auto mb-3" />
                    <p className="text-body text-primary-400">ยังไม่มีตำแหน่งงาน</p>
                    <p className="text-body-sm text-primary-300 mt-1">
                      คลิก "เพิ่มตำแหน่งงาน" เพื่อสร้างตำแหน่งงานแรก
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
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(position.id, position.name)}
                          icon={<Edit2 className="w-4 h-4" />}
                        >
                          แก้ไข
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(position.id)}
                          icon={<Trash2 className="w-4 h-4" />}
                          className="text-red-600 hover:text-red-700"
                        >
                          ลบ
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
              <h3 className="text-lg font-semibold text-gray-900">ลบตำแหน่งงาน</h3>
            </div>
            <p className="text-gray-600 mb-4">
              คุณแน่ใจหรือไม่ว่าต้องการลบตำแหน่งงานนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
                ยกเลิก
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                ลบ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
