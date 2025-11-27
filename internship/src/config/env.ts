// Environment configuration
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3011/api',
  appName: import.meta.env.VITE_APP_NAME || 'Getfly Technologies Internship Portal',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
} as const;

// Validate required environment variables
if (!config.apiBaseUrl) {
  console.warn('VITE_API_BASE_URL is not set. Using default: http://localhost:3011/api');
}

