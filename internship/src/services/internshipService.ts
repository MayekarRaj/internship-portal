import { apiClient } from '../api/client';
import type { Internship } from '../types';

// Public internship services
export const internshipService = {
  // Get all active internships
  getAll: async (): Promise<Internship[]> => {
    const response = await apiClient.get<Internship[]>('/internships');
    return response.data || [];
  },

  // Get single internship by ID
  getById: async (id: number): Promise<Internship> => {
    const response = await apiClient.get<Internship>(`/internships/${id}`);
    if (!response.data) {
      throw new Error('Internship not found');
    }
    return response.data;
  },
};

// Admin internship services
export const adminInternshipService = {
  // Get all internships (including inactive)
  getAll: async (): Promise<Internship[]> => {
    const response = await apiClient.get<Internship[]>('/admin/internships', true);
    return response.data || [];
  },

  // Get single internship by ID
  getById: async (id: number): Promise<Internship> => {
    const response = await apiClient.get<Internship>(`/admin/internships/${id}`, true);
    if (!response.data) {
      throw new Error('Internship not found');
    }
    return response.data;
  },

  // Create internship
  create: async (data: Partial<Internship>): Promise<Internship> => {
    const response = await apiClient.post<Internship>('/admin/internships', data, true);
    if (!response.data) {
      throw new Error(response.message || 'Failed to create internship');
    }
    return response.data;
  },

  // Update internship
  update: async (id: number, data: Partial<Internship>): Promise<Internship> => {
    const response = await apiClient.put<Internship>(`/admin/internships/${id}`, data, true);
    if (!response.data) {
      throw new Error(response.message || 'Failed to update internship');
    }
    return response.data;
  },

  // Delete internship
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/internships/${id}`, true);
  },

  // Toggle internship status
  toggleStatus: async (id: number, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/admin/internships/${id}/status`, { is_active: isActive }, true);
  },
};

