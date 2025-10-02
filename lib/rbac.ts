import { Role, User } from '@/types/models';

// Permission keys used across the app
export type Permission =
  | 'lab:view'
  | 'lab:book'
  | 'equipment:view'
  | 'equipment:request'
  | 'booking:view'
  | 'booking:create'
  | 'booking:manage' // cancel/modify
  | 'booking:approve'
  | 'maintenance:view'
  | 'maintenance:report'
  | 'maintenance:assign'
  | 'maintenance:resolve'
  | 'experiment:upload'
  | 'analytics:view'
  | 'users:manage';

const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: [
    'lab:view',
    'equipment:view',
    'equipment:request',
    'booking:view',
    'booking:manage',
    'booking:approve',
    'maintenance:view',
    'maintenance:assign',
    'maintenance:resolve',
    'experiment:upload',
    'analytics:view',
    'users:manage',
  ],
  FACULTY: [
    'lab:view',
    'lab:book',
    'equipment:view',
    'equipment:request',
    'booking:view',
    'booking:create',
    'booking:approve',
    'maintenance:view',
    'maintenance:report',
    'experiment:upload',
    'analytics:view',
  ],
  STUDENT: [
    'lab:view',
    'lab:book',
    'equipment:view',
    'booking:view',
    'booking:create',
    'maintenance:report',
    'experiment:upload',
  ],
  TECHNICIAN: [
    'lab:view',
    'equipment:view',
    'maintenance:view',
    'maintenance:assign',
    'maintenance:resolve',
    'booking:approve',
  ],
};

export function can(user: Pick<User, 'role'> | null | undefined, permission: Permission) {
  if (!user) return false;
  return rolePermissions[user.role].includes(permission);
}

export function permissionsFor(role: Role): Permission[] {
  return rolePermissions[role];
}
