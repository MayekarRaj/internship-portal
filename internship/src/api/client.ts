import { config } from '../config/env';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Client class
class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Get auth token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  // Build headers with optional auth token
  private buildHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: Record<string, string> = { ...this.defaultHeaders as Record<string, string> };
    
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers as HeadersInit;
  }

  // Handle response
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }

  // GET request
  async get<T>(endpoint: string, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.buildHeaders(requireAuth),
    });
    
    return this.handleResponse<T>(response);
  }

  // POST request
  async post<T>(endpoint: string, data?: any, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.buildHeaders(requireAuth),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.buildHeaders(requireAuth),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.buildHeaders(requireAuth),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  // DELETE request
  async delete<T>(endpoint: string, data?: any, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.buildHeaders(requireAuth),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  // Download file (for exports)
  async downloadFile(endpoint: string, filename: string, requireAuth: boolean = false): Promise<void> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.buildHeaders(requireAuth),
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(config.apiBaseUrl);

