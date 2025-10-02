export type Role = 'ADMIN' | 'FACULTY' | 'STUDENT' | 'TECHNICIAN';

export type Permission =
  | 'lab:view'
  | 'lab:book'
  | 'equipment:view'
  | 'equipment:request'
  | 'booking:view'
  | 'booking:create'
  | 'booking:manage'
  | 'booking:approve'
  | 'maintenance:view'
  | 'maintenance:report'
  | 'maintenance:assign'
  | 'maintenance:resolve'
  | 'experiment:upload'
  | 'analytics:view'
  | 'users:manage';

const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: ['lab:view','equipment:view','equipment:request','booking:view','booking:manage','booking:approve','maintenance:view','maintenance:assign','maintenance:resolve','experiment:upload','analytics:view','users:manage'],
  FACULTY: ['lab:view','lab:book','equipment:view','equipment:request','booking:view','booking:create','booking:approve','maintenance:view','maintenance:report','experiment:upload','analytics:view'],
  STUDENT: ['lab:view','lab:book','equipment:view','booking:view','booking:create','maintenance:report','experiment:upload'],
  TECHNICIAN: ['lab:view','equipment:view','maintenance:view','maintenance:assign','maintenance:resolve','booking:approve'],
};

export function can(role: Role, permission: Permission) {
  return rolePermissions[role]?.includes(permission) ?? false;
}
