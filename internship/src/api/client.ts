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

// Request interceptor type
export type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;

// Response interceptor type
export type ResponseInterceptor = <T>(response: Response, data: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;

// API Client class - Singleton pattern
class ApiClient {
  private static instance: ApiClient;
  private baseURL: string;
  private defaultHeaders: HeadersInit;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  private constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Get singleton instance
  public static getInstance(baseURL?: string): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(baseURL || config.apiBaseUrl);
    }
    return ApiClient.instance;
  }

  // Add request interceptor
  public addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  public addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
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

  // Apply request interceptors
  private async applyRequestInterceptors(requestConfig: RequestInit): Promise<RequestInit> {
    let config = requestConfig;
    for (const interceptor of this.requestInterceptors) {
      config = await interceptor(config);
    }
    return config;
  }

  // Apply response interceptors
  private async applyResponseInterceptors<T>(response: Response, data: ApiResponse<T>): Promise<ApiResponse<T>> {
    let result = data;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor<T>(response, result);
    }
    return result;
  }

  // Handle response
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    // Apply response interceptors
    return this.applyResponseInterceptors<T>(response, data);
  }

  // Base request method
  private async request<T>(
    endpoint: string,
    options: RequestInit,
    requireAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    const headers = this.buildHeaders(requireAuth);
    
    const requestConfig: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    };

    // Apply request interceptors
    const finalConfig = await this.applyRequestInterceptors(requestConfig);

    const response = await fetch(`${this.baseURL}${endpoint}`, finalConfig);
    
    return this.handleResponse<T>(response);
  }

  // GET request
  async get<T>(endpoint: string, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    }, requireAuth);
  }

  // POST request
  async post<T>(endpoint: string, data?: any, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, requireAuth);
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, requireAuth);
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, requireAuth);
  }

  // DELETE request
  async delete<T>(endpoint: string, data?: any, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    }, requireAuth);
  }

  // Download file (for exports)
  async downloadFile(endpoint: string, filename: string, requireAuth: boolean = false): Promise<void> {
    const headers = this.buildHeaders(requireAuth);
    const requestConfig: RequestInit = {
      headers,
    };

    const finalConfig = await this.applyRequestInterceptors(requestConfig);

    const response = await fetch(`${this.baseURL}${endpoint}`, finalConfig);

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

  // Update base URL (useful for testing or dynamic config)
  public setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  // Get current base URL
  public getBaseURL(): string {
    return this.baseURL;
  }
}

// Create and export singleton API client instance
export const apiClient = ApiClient.getInstance();

// Export class for testing purposes (allows creating test instances)
export { ApiClient };
