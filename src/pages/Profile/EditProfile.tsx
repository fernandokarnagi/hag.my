import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { updateUserProfile } from '@/services/userService';
import { ArrowLeft, Save, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EditProfile() {
  const { userProfile } = useAuthContext();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
    }
  }, [userProfile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userProfile) return;

    setLoading(true);
    try {
      await updateUserProfile(userProfile.uid, { displayName });
      toast('Profile updated successfully', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!userProfile) {
    return <div className="flex items-center justify-center h-64 text-text-secondary">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/" className="btn btn-ghost btn-sm p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text">Edit Profile</h1>
          <p className="text-sm text-text-secondary">Update your account information</p>
        </div>
      </div>

      <div className="card p-6 max-w-lg">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <User className="h-8 w-8 text-accent" />
          </div>
          <div>
            <p className="text-lg font-semibold text-text">{userProfile.displayName}</p>
            <p className="text-sm text-text-secondary">{userProfile.email}</p>
            <span className="badge-info mt-1">{userProfile.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Email</label>
            <input
              type="email"
              value={userProfile.email}
              className="input-field opacity-60"
              disabled
            />
            <p className="mt-1 text-xs text-text-muted">Email cannot be changed</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Role</label>
            <input
              type="text"
              value={userProfile.role}
              className="input-field opacity-60 capitalize"
              disabled
            />
            <p className="mt-1 text-xs text-text-muted">Contact admin to change role</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link to="/" className="btn btn-secondary btn-md">Cancel</Link>
            <button type="submit" disabled={loading || displayName === userProfile.displayName} className="btn btn-primary btn-md">
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
