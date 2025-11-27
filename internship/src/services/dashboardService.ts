import { apiClient } from '../api';
import type { DashboardMetrics, RecentApplication } from '../types';

export interface DashboardData {
  metrics: DashboardMetrics;
  recentApplications: RecentApplication[];
}

// Admin dashboard services
export const dashboardService = {
  // Get dashboard metrics
  getMetrics: async (): Promise<DashboardData> => {
    const response = await apiClient.get<DashboardData>('/admin/dashboard', true);
    if (!response.data) {
      throw new Error(response.message || 'Failed to fetch dashboard data');
    }
    return response.data;
  },
};

