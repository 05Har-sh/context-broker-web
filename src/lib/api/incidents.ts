import { apiClient } from './client';
import { IncidentItem, PaginatedResponse, IncidentEvent } from '@/types';

export interface IncidentFilterParams {
  page?: number;
  size?: number;
  severity?: string;
  assignedTo?: string;
  stale?: boolean | string;
  jiraStatus?: string;
}

export const incidentApi = {
  // 9) GET /incident/{incidentKey}
  getIncident: async (incidentKey: string): Promise<IncidentItem> => {
    return apiClient(`/incident/${incidentKey}`);
  },

  // 10) GET /incident/{incidentKey}/timeline
  getIncidentTimeline: async (incidentKey: string): Promise<IncidentEvent[]> => {
    return apiClient(`/incident/${incidentKey}/timeline`);
  },

  // 11) GET /incident/incident-details/{incidentKey}
  getIncidentDetails: async (incidentKey: string): Promise<IncidentItem> => {
    return apiClient(`/incident/incident-details/${incidentKey}`);
  },

  // 12) GET /incident/metrics
  getMetrics: async (): Promise<any> => {
    return apiClient('/incident/metrics');
  },

  // 13) GET /incident/all
  getIncidents: async (params?: IncidentFilterParams): Promise<PaginatedResponse<IncidentItem>> => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size !== undefined) query.set('size', String(params.size));
    if (params?.severity) query.set('severity', params.severity);
    if (params?.assignedTo) query.set('assignedTo', params.assignedTo);
    if (params?.stale !== undefined) query.set('stale', String(params.stale));
    if (params?.jiraStatus) query.set('jiraStatus', params.jiraStatus);
    return apiClient(`/incident/all?${query.toString()}`);
  },

  // 14) GET /incident/system-health
  getSystemHealth: async (): Promise<{ status: string; score: number; reasons: string[] }> => {
    return apiClient('/incident/system-health');
  },

  // 15) GET /incident/risk-score/{incidentKey}
  getIncidentRiskScore: async (incidentKey: string): Promise<{ incidentKey: string; riskScore: number; reason?: string }> => {
    return apiClient(`/incident/risk-score/${incidentKey}`);
  },

  // 16) GET /incident/priority/{incidentKey}
  getIncidentPriority: async (incidentKey: string): Promise<{ incidentKey: string; priority: string }> => {
    return apiClient(`/incident/priority/${incidentKey}`);
  },

  // 17) GET /incident/highest-risk
  getHighestRisk: async (): Promise<{ incidentKey: string; riskScore: number }> => {
    return apiClient('/incident/highest-risk');
  },

  // 18) GET /incident/severity-distribution
  getSeverityDistribution: async (): Promise<Array<{ severity: string; count: number }>> => {
    return apiClient('/incident/severity-distribution');
  },

  // 19) GET /incident/trend
  getTrend: async (): Promise<Array<{ date: string; count: number }>> => {
    return apiClient('/incident/trend');
  },

  // 20) POST /incident/{incidentKey}/assign
  assignIncident: async (incidentKey: string, assignedTo: string): Promise<{ message: string }> => {
    return apiClient(`/incident/${incidentKey}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedTo }),
    });
  },
};

