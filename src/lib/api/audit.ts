import { apiClient } from './client';
import { PaginatedResponse } from '@/types';

export interface AuditEvent {
  id: string;
  type: string;
  actor: string;
  timestamp: string;
  description: string;
  status: 'SUCCESS' | 'FAILURE';
}

const MOCK_EVENTS: AuditEvent[] = [
  { id: '1', type: 'USER_LOGIN', actor: 'admin@acmecorp.com', timestamp: new Date().toISOString(), description: 'User logged in successfully', status: 'SUCCESS' },
  { id: '2', type: 'INTEGRATION_CONNECTED', actor: 'admin@acmecorp.com', timestamp: new Date().toISOString(), description: 'Connected Slack integration', status: 'SUCCESS' },
  { id: '3', type: 'WEBHOOK_FAILURE', actor: 'system', timestamp: new Date().toISOString(), description: 'Failed to verify Jira webhook signature', status: 'FAILURE' }
];

export const auditApi = {
  getAuditEvents: async (params?: { page?: number, size?: number }): Promise<PaginatedResponse<AuditEvent>> => {
    return new Promise(resolve => setTimeout(() => resolve({
      content: MOCK_EVENTS,
      page: params?.page || 0,
      size: params?.size || 10,
      totalElements: MOCK_EVENTS.length,
      totalPages: 1
    }), 400));
  }
};
