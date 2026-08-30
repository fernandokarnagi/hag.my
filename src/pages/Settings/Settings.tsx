import { useUsers, useUpdateUserRole, useUpdateUserActive } from '@/hooks/useUsers';
import { useAuthContext } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import type { UserRole } from '@/types';
import { Users, Shield } from 'lucide-react';

export function Settings() {
  const { userProfile } = useAuthContext();
  const { toast } = useToast();
  const { data: users = [], isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const updateActive = useUpdateUserActive();

  async function handleRoleChange(uid: string, role: UserRole) {
    try {
      await updateRole.mutateAsync({ uid, role });
      toast('Role updated successfully', 'success');
    } catch {
      toast('Failed to update role', 'error');
    }
  }

  async function handleActiveToggle(uid: string, active: boolean) {
    try {
      await updateActive.mutateAsync({ uid, active });
      toast(active ? 'User activated' : 'User deactivated', 'success');
    } catch {
      toast('Failed to update user', 'error');
    }
  }

  if (userProfile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 rounded-full bg-danger/10 p-4">
          <Shield className="h-8 w-8 text-danger" />
        </div>
        <p className="text-text-secondary">Access denied. Admin only.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-sm text-text-secondary">Manage user access and roles</p>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-border/50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-text-muted" />
            <h2 className="font-semibold text-text">User Management</h2>
          </div>
          <p className="mt-1 text-sm text-text-secondary">{users.length} users registered</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-surface-lighter/30">
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Email</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Role</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.uid} className="table-row">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                        {user.displayName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="text-sm font-medium text-text">{user.displayName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                      disabled={updateRole.isPending}
                      className="input-field w-auto min-w-[100px]"
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
                      disabled={updateActive.isPending}
                      className={`badge cursor-pointer transition-all ${
                        user.active
                          ? 'badge-success hover:bg-success/25'
                          : 'badge-danger hover:bg-danger/25'
                      }`}
                    >
                      {user.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
