import { apiClient } from './client';
import { Metrics } from '@/types';

export const analyticsApi = {
  getMetrics: async (): Promise<Metrics> => {
    return new Promise(resolve => setTimeout(() => resolve({
      total: 1250,
      active: 12,
      critical: 3,
      stale: 5,
      averageRisk: 42,
      resolved: 1238
    }), 400));
  },
  
  getSeverityDistribution: async (): Promise<{ severity: string; count: number }[]> => {
    return new Promise(resolve => setTimeout(() => resolve([
      { severity: 'CRITICAL', count: 3 },
      { severity: 'HIGH', count: 8 },
      { severity: 'MEDIUM', count: 15 },
      { severity: 'LOW', count: 42 }
    ]), 400));
  },

  getTrend: async (): Promise<{ count: number; date: string }[]> => {
    return new Promise(resolve => setTimeout(() => {
      const data = [];
      const now = new Date();
      for (let i = 14; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        data.push({ date: d.toISOString().split('T')[0], count: Math.floor(Math.random() * 20) });
      }
      resolve(data);
    }, 400));
  }
};
