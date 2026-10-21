import { Role } from '@/types';

export type Permission = 
  | 'VIEW_INCIDENTS' 
  | 'VIEW_INCIDENT_DETAILS' 
  | 'ASSIGN_INCIDENT'
  | 'MANAGE_INTEGRATIONS'
  | 'MANAGE_MEMBERS'
  | 'MANAGE_WORKSPACE'
  | 'VIEW_AUDIT_LOG'
  | 'VIEW_ANALYTICS';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    'VIEW_INCIDENTS',
    'VIEW_INCIDENT_DETAILS',
    'ASSIGN_INCIDENT',
    'MANAGE_INTEGRATIONS',
    'MANAGE_MEMBERS',
    'MANAGE_WORKSPACE',
    'VIEW_AUDIT_LOG',
    'VIEW_ANALYTICS'
  ],
  ADMIN: [
    'VIEW_INCIDENTS',
    'VIEW_INCIDENT_DETAILS',
    'ASSIGN_INCIDENT',
    'MANAGE_INTEGRATIONS',
    'MANAGE_MEMBERS',
    'MANAGE_WORKSPACE',
    'VIEW_AUDIT_LOG',
    'VIEW_ANALYTICS'
  ],
  MEMBER: [
    'VIEW_INCIDENTS',
    'VIEW_INCIDENT_DETAILS',
    'ASSIGN_INCIDENT',
    'VIEW_ANALYTICS'
  ],
  USER: [
    'VIEW_INCIDENTS',
    'VIEW_INCIDENT_DETAILS',
    'ASSIGN_INCIDENT',
    'VIEW_ANALYTICS'
  ]
};

export function hasPermission(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
