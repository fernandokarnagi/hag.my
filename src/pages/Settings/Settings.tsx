import { useState } from 'react';
import { useUsers, useUpdateUserRole, useUpdateUserActive } from '@/hooks/useUsers';
import { useAuthContext } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { registerUser } from '@/services/authService';
import type { UserRole } from '@/types';
import { Users, Shield, Plus, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface NewUserForm {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export function Settings() {
  const { userProfile } = useAuthContext();
  const { toast } = useToast();
  const { data: users = [], isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const updateActive = useUpdateUserActive();
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState<NewUserForm>({ email: '', password: '', displayName: '', role: 'cs' });
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ uid: string; name: string } | null>(null);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await registerUser(newUser.email, newUser.password, newUser.displayName, newUser.role);
      toast('User created successfully', 'success');
      setShowAddUser(false);
      setNewUser({ email: '', password: '', displayName: '', role: 'cs' });
    } catch (err: any) {
      toast(err.message || 'Failed to create user', 'error');
    } finally {
      setCreating(false);
    }
  }

  async function handleRoleChange(uid: string, role: UserRole) {
    try { await updateRole.mutateAsync({ uid, role }); toast('Role updated', 'success'); }
    catch { toast('Failed to update role', 'error'); }
  }

  async function handleActiveToggle(uid: string, active: boolean) {
    try { await updateActive.mutateAsync({ uid, active }); toast(active ? 'User activated' : 'User deactivated', 'success'); }
    catch { toast('Failed to update user', 'error'); }
  }

  if (userProfile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 rounded-full bg-danger/10 p-4"><Shield className="h-8 w-8 text-danger" /></div>
        <p className="text-text-secondary">Access denied. Admin only.</p>
      </div>
    );
  }

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-16 skeleton" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">User Management</h1>
          <p className="text-sm text-text-secondary">{users.length} users registered</p>
        </div>
        <button onClick={() => setShowAddUser(true)} className="btn btn-primary btn-md">
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-light">
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">User</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Email</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Role</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.uid} className="table-row">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                        {user.displayName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">{user.displayName}</p>
                        <p className="text-xs text-text-muted">{user.uid.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                      disabled={updateRole.isPending || user.uid === userProfile?.uid}
                      className="input-field w-auto min-w-[110px]"
                    >
                      <option value="admin">Admin</option>
                      <option value="sales">Sales</option>
                      <option value="cs">CS</option>
                      <option value="engineer">Engineer</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleActiveToggle(user.uid, !user.active)}
                      disabled={updateActive.isPending || user.uid === userProfile?.uid}
                      className={`badge cursor-pointer transition-all ${user.active ? 'badge-success' : 'badge-danger'}`}
                    >
                      {user.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {user.uid !== userProfile?.uid && (
                      <button
                        onClick={() => setDeleteConfirm({ uid: user.uid, name: user.displayName })}
                        className="text-sm text-danger hover:text-danger-hover"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 animate-fade-in" onClick={() => setShowAddUser(false)} />
          <div className="relative w-full max-w-md animate-scale-in">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text">Add New User</h2>
                <button onClick={() => setShowAddUser(false)} className="text-text-muted hover:text-text">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Display Name</label>
                  <input type="text" value={newUser.displayName} onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Email</label>
                  <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Password</label>
                  <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="input-field" required minLength={6} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Role</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })} className="input-field">
                    <option value="cs">CS</option>
                    <option value="sales">Sales</option>
                    <option value="engineer">Engineer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button type="button" onClick={() => setShowAddUser(false)} className="btn btn-secondary btn-md">Cancel</button>
                  <button type="submit" disabled={creating} className="btn btn-primary btn-md">
                    {creating ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Deactivate User"
        message={`Deactivate ${deleteConfirm?.name}? They won't be able to log in.`}
        confirmLabel="Deactivate"
        danger
        onConfirm={() => {
          if (deleteConfirm) handleActiveToggle(deleteConfirm.uid, false);
          setDeleteConfirm(null);
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
