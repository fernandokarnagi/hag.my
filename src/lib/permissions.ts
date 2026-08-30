import type { UserRole } from '@/types';

export const ROLE_PERMISSIONS = {
  admin: {
    canCreateLead: true,
    canEditLead: true,
    canDeleteLead: true,
    canViewAllLeads: true,
    canUpdateStatus: true,
    canManageUsers: true,
    canViewReports: true,
    canBulkUpdate: true,
    canViewAuditLog: true,
  },
  cs: {
    canCreateLead: true,
    canEditLead: true,
    canDeleteLead: false,
    canViewAllLeads: true,
    canUpdateStatus: true,
    canManageUsers: false,
    canViewReports: true,
    canBulkUpdate: true,
    canViewAuditLog: true,
  },
  sales: {
    canCreateLead: true,
    canEditLead: true,
    canDeleteLead: false,
    canViewAllLeads: false,
    canUpdateStatus: true,
    canManageUsers: false,
    canViewReports: false,
    canBulkUpdate: false,
    canViewAuditLog: false,
  },
  engineer: {
    canCreateLead: false,
    canEditLead: false,
    canDeleteLead: false,
    canViewAllLeads: true,
    canUpdateStatus: true,
    canManageUsers: false,
    canViewReports: false,
    canBulkUpdate: false,
    canViewAuditLog: false,
  },
} as const;

export type Permission = keyof typeof ROLE_PERMISSIONS.admin;

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}

export function canAccessPage(role: UserRole | undefined, page: string): boolean {
  if (!role) return true;

  switch (page) {
    case 'dashboard':
      return true;
    case 'leads':
      return true;
    case 'daily-update':
      return hasPermission(role, 'canBulkUpdate');
    case 'reports':
      return hasPermission(role, 'canViewReports');
    case 'settings':
      return true;
    default:
      return false;
  }
}
