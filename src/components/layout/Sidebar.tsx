import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardList, FileText, Settings, LogOut, Menu, X, Zap, User,
} from 'lucide-react';
import { logoutUser } from '@/services/authService';
import { useAuthContext } from '@/components/AuthProvider';
import { canAccessPage } from '@/lib/permissions';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
  { to: '/leads', icon: Users, label: 'Leads', page: 'leads' },
  { to: '/daily-update', icon: ClipboardList, label: 'Daily Update', page: 'daily-update' },
  { to: '/reports', icon: FileText, label: 'Reports', page: 'reports' },
  { to: '/settings', icon: Settings, label: 'Settings', page: 'settings' },
];

export function Sidebar() {
  const { userProfile } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const accessibleNavItems = navItems.filter((item) =>
    canAccessPage(userProfile?.role, item.page)
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2.5 text-text-secondary hover:text-text border border-border md:hidden transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar transition-transform duration-300 ease-out md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <div>
            <span className="text-base font-semibold text-text">HAG CRM</span>
            <p className="text-[10px] text-text-muted">Management System</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="ml-auto text-text-muted hover:text-text md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {accessibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <div className="mb-3 rounded-lg bg-surface-light px-3 py-2">
            <p className="text-sm font-medium text-text truncate">{userProfile?.displayName}</p>
            <p className="text-xs text-text-muted capitalize">{userProfile?.role}</p>
          </div>
          <nav className="space-y-1">
            <NavLink
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <User className="h-5 w-5" />
              Edit Profile
            </NavLink>
            <button onClick={() => logoutUser()} className="sidebar-link w-full text-text-muted hover:text-danger">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}
