import { apiClient } from './client';
import { Member, Role } from '@/types';

export const memberApi = {
  getMembers: async (): Promise<Member[]> => {
    return apiClient('/members');
  },

  inviteMember: async (email: string, role: Role): Promise<Member> => {
    return apiClient('/members', {
      method: 'POST',
      body: JSON.stringify({ email, role })
    });
  },

  updateMemberRole: async (memberId: string, role: Role): Promise<Member> => {
    return apiClient(`/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  },

  removeMember: async (memberId: string): Promise<void> => {
    return apiClient(`/members/${memberId}`, {
      method: 'DELETE'
    });
  }
};
