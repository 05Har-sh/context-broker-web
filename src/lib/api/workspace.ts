import { apiClient } from './client';
import { Workspace, Organization } from '@/types';

export const workspaceApi = {
  getWorkspace: async (): Promise<Workspace> => {
    return apiClient('/workspace');
  },
  
  createWorkspace: async (data: { name: string; slug?: string }): Promise<Workspace> => {
    return apiClient('/workspace', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateWorkspace: async (data: Partial<Workspace>): Promise<Workspace> => {
    return apiClient('/workspace', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
};

export const organizationApi = {
  getOrganization: async (): Promise<Organization> => {
    return apiClient('/organization');
  },

  updateOrganization: async (data: Partial<Organization>): Promise<Organization> => {
    return apiClient('/organization', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
};

