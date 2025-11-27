import type { RequestInterceptor, ResponseInterceptor } from './client';

// Example: Request interceptor for logging
export const loggingRequestInterceptor: RequestInterceptor = (config) => {
  if (import.meta.env.DEV) {
    console.log('[API Request]', config);
  }
  return config;
};

// Example: Response interceptor for error handling
export const errorResponseInterceptor: ResponseInterceptor = (response: Response, data: any) => {
  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    if (window.location.hash.startsWith('#admin')) {
      window.location.hash = '#admin/login';
    }
  }

  // Handle 403 Forbidden
  if (response.status === 403) {
    console.error('Access forbidden');
  }

  return data;
};

// Example: Response interceptor for logging
export const loggingResponseInterceptor: ResponseInterceptor = (response: Response, data: any) => {
  if (import.meta.env.DEV) {
    console.log('[API Response]', response.status, data);
  }
  return data;
};

