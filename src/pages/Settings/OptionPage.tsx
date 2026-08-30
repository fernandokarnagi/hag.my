import { useState } from 'react';
import { useToast } from '@/components/Toast';
import { useAuthContext } from '@/components/AuthProvider';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { hasPermission } from '@/lib/permissions';
import { Plus, X, Shield } from 'lucide-react';

interface OptionItem {
  id: string;
  value: string;
  label: string;
  order: number;
  active: boolean;
}

interface OptionPageProps {
  title: string;
  subtitle: string;
  items: OptionItem[];
  isLoading: boolean;
  onAdd: (data: Omit<OptionItem, 'id'>) => Promise<any>;
  onUpdate: (id: string, data: Partial<OptionItem>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

export function OptionPage({ title, subtitle, items, isLoading, onAdd, onUpdate, onDelete }: OptionPageProps) {
  const { userProfile } = useAuthContext();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ value: '', label: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; label: string } | null>(null);
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
        await onUpdate(editId, { value: form.value, label: form.label });
        toast('Updated successfully', 'success');
      } else {
        await onAdd({ value: form.value, label: form.label, order: items.length, active: true });
        toast('Added successfully', 'success');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ value: '', label: '' });
    } catch { toast('Failed to save', 'error'); }
    setSaving(false);
  }

  function handleEdit(id: string, value: string, label: string) {
    setEditId(id);
    setForm({ value, label });
    setShowForm(true);
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try { await onDelete(deleteConfirm.id); toast('Deleted', 'success'); }
    catch { toast('Failed to delete', 'error'); }
    setDeleteConfirm(null);
  }

  async function handleToggleActive(id: string, active: boolean) {
    try { await onUpdate(id, { active }); toast(active ? 'Activated' : 'Deactivated', 'success'); }
    catch { toast('Failed to update', 'error'); }
  }

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-12 skeleton" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">{title}</h1>
          <p className="text-sm text-text-secondary">{items.length} {subtitle}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ value: '', label: '' }); }} className="btn btn-primary btn-md">
          <Plus className="h-4 w-4" /> Add
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
            {items.map((item) => (
              <tr key={item.id} className="table-row">
                <td className="px-6 py-4 text-sm font-medium text-text">{item.label}</td>
                <td className="px-6 py-4 text-sm font-mono text-text-secondary">{item.value}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleToggleActive(item.id, !item.active)} className={`badge cursor-pointer transition-all ${item.active ? 'badge-success' : 'badge-danger'}`}>
                    {item.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => handleEdit(item.id, item.value, item.label)} className="text-sm text-accent hover:text-accent-hover">Edit</button>
                  <button onClick={() => setDeleteConfirm({ id: item.id, label: item.label })} className="text-sm text-danger hover:text-danger-hover">Delete</button>
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
                <h2 className="text-lg font-semibold text-text">{editId ? 'Edit' : 'Add New'}</h2>
                <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Label</label>
                  <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Value</label>
                  <input type="text" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="input-field font-mono" required />
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

      <ConfirmDialog open={!!deleteConfirm} title="Delete Item" message={`Delete "${deleteConfirm?.label}"? This cannot be undone.`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteConfirm(null)} />
    </div>
  );
}
