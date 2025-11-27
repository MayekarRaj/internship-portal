import { apiClient } from '../api';
import type { Application, InternshipApplication } from '../types';
import type { PaginatedResponse } from '../api/client';

// Public application services
export const applicationService = {
  // Submit application
  submit: async (data: InternshipApplication): Promise<{ applicationId: number }> => {
    const response = await apiClient.post<{ applicationId: number }>('/applications', data);
    if (!response.data) {
      throw new Error(response.message || 'Failed to submit application');
    }
    return response.data;
  },
};

// Admin application services
export const adminApplicationService = {
  // Get all applications with filters
  getAll: async (params?: {
    page?: number;
    limit?: number;
    internship_id?: number;
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<Application>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.internship_id) queryParams.append('internship_id', params.internship_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);

    const queryString = queryParams.toString();
    const endpoint = `/admin/applications${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<{ applications: Application[]; pagination: any }>(endpoint, true);
    if (!response.data) {
      throw new Error(response.message || 'Failed to fetch applications');
    }
    // Transform backend response to match PaginatedResponse format
    return {
      data: response.data.applications || [],
      pagination: response.data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      },
    };
  },

  // Get single application by ID
  getById: async (id: number): Promise<Application> => {
    const response = await apiClient.get<Application>(`/admin/applications/${id}`, true);
    if (!response.data) {
      throw new Error(response.message || 'Application not found');
    }
    return response.data;
  },

  // Get applications by internship ID
  getByInternship: async (internshipId: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Application>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/admin/internships/${internshipId}/applications${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<{ applications: Application[]; pagination: any }>(endpoint, true);
    if (!response.data) {
      throw new Error(response.message || 'Failed to fetch applications');
    }
    // Transform backend response to match PaginatedResponse format
    return {
      data: response.data.applications || [],
      pagination: response.data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      },
    };
  },

  // Update application status
  updateStatus: async (id: number, status: string): Promise<void> => {
    await apiClient.patch(`/admin/applications/${id}/status`, { status }, true);
  },

  // Delete application
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/applications/${id}`, true);
  },

  // Bulk update status
  bulkUpdateStatus: async (applicationIds: number[], status: string): Promise<{ updated_count: number }> => {
    const response = await apiClient.patch<{ updated_count: number }>(
      '/admin/applications/bulk/status',
      { application_ids: applicationIds, status },
      true
    );
    if (!response.data) {
      throw new Error(response.message || 'Failed to update status');
    }
    return response.data;
  },

  // Bulk delete
  bulkDelete: async (applicationIds: number[]): Promise<{ deleted_count: number }> => {
    const response = await apiClient.delete<{ deleted_count: number }>(
      `/admin/applications/bulk`,
      { application_ids: applicationIds },
      true
    );
    if (!response.data) {
      throw new Error(response.message || 'Failed to delete applications');
    }
    return response.data;
  },

  // Export applications
  export: async (params?: {
    internship_id?: number;
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<void> => {
    const queryParams = new URLSearchParams();
    if (params?.internship_id) queryParams.append('internship_id', params.internship_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);

    const queryString = queryParams.toString();
    const endpoint = `/admin/applications/export${queryString ? `?${queryString}` : ''}`;
    const filename = `applications-${new Date().toISOString().slice(0, 10)}.csv`;
    
    await apiClient.downloadFile(endpoint, filename, true);
  },
};

