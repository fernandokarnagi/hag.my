import { useState } from 'react';
import { useEmployees, useAddEmployee, useUpdateEmployee, useDeleteEmployee } from '@/hooks/useOptions';
import { useToast } from '@/components/Toast';
import { useAuthContext } from '@/components/AuthProvider';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { hasPermission } from '@/lib/permissions';
import { Plus, X, Shield } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

export function Employees() {
  const { userProfile } = useAuthContext();
  const { toast } = useToast();
  const { data: items = [], isLoading } = useEmployees();
  const addEmp = useAddEmployee();
  const updateEmp = useUpdateEmployee();
  const deleteEmp = useDeleteEmployee();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', role: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const canManage = hasPermission(userProfile?.role, 'canManageUsers');

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 rounded-full bg-danger/10 p-4"><Shield className="h-8 w-8 text-danger" /></div>
        <p className="text-text-secondary">Access denied. Admin only.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await updateEmp.mutateAsync({ id: editId, data: form });
        toast('Updated successfully', 'success');
      } else {
        await addEmp.mutateAsync({ ...form, active: true });
        toast('Added successfully', 'success');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', role: '' });
    } catch { toast('Failed to save', 'error'); }
    setSaving(false);
  }

  function handleEdit(id: string, name: string, role: string) {
    setEditId(id);
    setForm({ name, role });
    setShowForm(true);
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try { await deleteEmp.mutateAsync(deleteConfirm.id); toast('Deleted', 'success'); }
    catch { toast('Failed to delete', 'error'); }
    setDeleteConfirm(null);
  }

  async function handleToggleActive(id: string, active: boolean) {
    try { await updateEmp.mutateAsync({ id, data: { active } }); toast(active ? 'Activated' : 'Deactivated', 'success'); }
    catch { toast('Failed to update', 'error'); }
  }

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-12 skeleton" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Employees</h1>
          <p className="text-sm text-text-secondary">{items.length} employees registered</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', role: '' }); }} className="btn btn-primary btn-md">
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-light">
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Name</th>
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Role</th>
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Status</th>
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((emp) => (
              <tr key={emp.id} className="table-row">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                      {emp.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="text-sm font-medium text-text">{emp.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">{emp.role}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleToggleActive(emp.id, !emp.active)} className={`badge cursor-pointer transition-all ${emp.active ? 'badge-success' : 'badge-danger'}`}>
                    {emp.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => handleEdit(emp.id, emp.name, emp.role)} className="text-sm text-accent hover:text-accent-hover">Edit</button>
                  <button onClick={() => setDeleteConfirm({ id: emp.id, name: emp.name })} className="text-sm text-danger hover:text-danger-hover">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 animate-fade-in" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md animate-scale-in">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text">{editId ? 'Edit Employee' : 'Add Employee'}</h2>
                <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field" required>
                    <option value="">Select...</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Site Surveyor">Site Surveyor</option>
                    <option value="Engineer">Engineer</option>
                    <option value="Project Manager">Project Manager</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary btn-md">Cancel</button>
                  <button type="submit" disabled={saving} className="btn btn-primary btn-md">{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteConfirm} title="Delete Employee" message={`Delete "${deleteConfirm?.name}"? This cannot be undone.`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteConfirm(null)} />
    </div>
  );
}
