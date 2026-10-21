export type Role = 'ADMIN' | 'USER' | 'OWNER' | 'MEMBER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  authProvider: string;
  providerUserId: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  // Legacy / convenience fields
  name?: string;
  role?: Role;
  workspaceId?: string;
}

export interface OrganizationMembership {
  id: string;
  userId: string;
  tenantId: string;
  role: Role;
  joinedAt: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE';
}

export interface Organization {
  id: string;
  name: string;
  workspaceUrl: string;
  industry: string;
  teamSize: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
  workspaceUrl?: string;
  industry?: string;
  teamSize?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'PENDING';
  joinedAt: string;
}

export interface IncidentEvent {
  source: string;
  content: string | null;
  eventType: string;
  description: string;
  timestamp: string;
}

export interface IncidentItem {
  key?: string;
  incidentKey?: string;
  summary?: string;
  lastMsg?: string;
  severity?: string;
  incidentStatus?: string;
  jiraStatus?: string;
  created?: string;
  riskScore?: number;
  assignedTo?: string | null;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Integration {
  id: string;
  name: string;
  connected: boolean;
  type: 'slack' | 'jira';
  /** Slack: workspace/team name, e.g. "Acme Corp" */
  workspaceName?: string;
  /** Slack: team ID, e.g. "T123456" */
  teamId?: string;
  /** Jira: site URL, e.g. "acme.atlassian.net" */
  siteName?: string;
  /** Jira: webhook ID */
  jiraWebhookId?: string;
  connectedAt?: string;
  details?: {
    webhookUrl?: string;
    lastSynced?: string;
  };
}

export interface SystemHealth {
  score: number;
  status: string;
  reasons: string[];
}

export interface Metrics {
  total: number;
  active: number;
  critical: number;
  stale: number;
  averageRisk: number;
  resolved: number;
}
