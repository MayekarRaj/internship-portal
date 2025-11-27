import { apiClient } from '../api';
import type { Admin } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

// Admin authentication services
export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/admin/auth/login', credentials);
    if (!response.data) {
      throw new Error(response.message || 'Login failed');
    }
    return response.data;
  },

  // Get current admin (verify token)
  getCurrentAdmin: async (): Promise<Admin> => {
    const response = await apiClient.get<{ admin: Admin }>('/admin/auth/me', true);
    if (!response.data?.admin) {
      throw new Error(response.message || 'Failed to verify admin');
    }
    return response.data.admin;
  },

  // Logout (client-side only, just removes token)
  logout: async (): Promise<void> => {
    // In a stateless JWT system, logout is handled client-side
    // Optionally call the logout endpoint for server-side logging
    try {
      await apiClient.post('/admin/auth/logout', {}, true);
    } catch (error) {
      // Ignore errors on logout
      console.log('Logout endpoint call failed (this is okay)');
    }
  },
};

