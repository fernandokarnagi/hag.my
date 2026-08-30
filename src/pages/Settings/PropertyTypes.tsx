import { useState } from 'react';
import { usePropertyTypes, useAddPropertyType, useUpdatePropertyType, useDeletePropertyType } from '@/hooks/useOptions';
import { useToast } from '@/components/Toast';
import { useAuthContext } from '@/components/AuthProvider';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { hasPermission } from '@/lib/permissions';
import { Plus, X, Shield } from 'lucide-react';

export function PropertyTypes() {
  const { userProfile } = useAuthContext();
  const { toast } = useToast();
  const { data: types = [], isLoading } = usePropertyTypes();
  const addType = useAddPropertyType();
  const updateType = useUpdatePropertyType();
  const deleteType = useDeletePropertyType();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ value: '', label: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; label: string } | null>(null);

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
    try {
      if (editId) {
        await updateType.mutateAsync({ id: editId, data: { value: form.value, label: form.label } });
        toast('Type updated', 'success');
      } else {
        await addType.mutateAsync({ value: form.value, label: form.label, order: types.length, active: true });
        toast('Type added', 'success');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ value: '', label: '' });
    } catch { toast('Failed to save', 'error'); }
  }

  function handleEdit(id: string, value: string, label: string) {
    setEditId(id);
    setForm({ value, label });
    setShowForm(true);
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try { await deleteType.mutateAsync(deleteConfirm.id); toast('Type deleted', 'success'); }
    catch { toast('Failed to delete', 'error'); }
    setDeleteConfirm(null);
  }

  async function handleToggleActive(id: string, active: boolean) {
    try { await updateType.mutateAsync({ id, data: { active } }); toast(active ? 'Activated' : 'Deactivated', 'success'); }
    catch { toast('Failed to update', 'error'); }
  }

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-12 skeleton" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Property Types</h1>
          <p className="text-sm text-text-secondary">{types.length} types configured</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ value: '', label: '' }); }} className="btn btn-primary btn-md">
          <Plus className="h-4 w-4" /> Add Type
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-light">
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Label</th>
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Value</th>
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Status</th>
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.id} className="table-row">
                <td className="px-6 py-4 text-sm font-medium text-text">{t.label}</td>
                <td className="px-6 py-4 text-sm font-mono text-text-secondary">{t.value}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleToggleActive(t.id, !t.active)} className={`badge cursor-pointer transition-all ${t.active ? 'badge-success' : 'badge-danger'}`}>
                    {t.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => handleEdit(t.id, t.value, t.label)} className="text-sm text-accent hover:text-accent-hover">Edit</button>
                  <button onClick={() => setDeleteConfirm({ id: t.id, label: t.label })} className="text-sm text-danger hover:text-danger-hover">Delete</button>
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
                <h2 className="text-lg font-semibold text-text">{editId ? 'Edit Type' : 'Add Type'}</h2>
                <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Label</label>
                  <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="input-field" placeholder="e.g. Terrace" required />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Value</label>
                  <input type="text" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="input-field font-mono" placeholder="Terrace" required />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary btn-md">Cancel</button>
                  <button type="submit" disabled={addType.isPending || updateType.isPending} className="btn btn-primary btn-md">
                    {addType.isPending || updateType.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteConfirm} title="Delete Type" message={`Delete "${deleteConfirm?.label}"? This cannot be undone.`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteConfirm(null)} />
    </div>
  );
}
