# API Client Documentation

## Overview

The API client is a **singleton instance** that provides a centralized way to make HTTP requests to the backend API. It handles authentication, error handling, and provides a consistent interface across the application.

## Structure

```
src/api/
├── client.ts          # Main API client class (singleton)
├── interceptors.ts    # Request/response interceptors
├── index.ts           # Central exports
└── README.md          # This file
```

## Singleton Pattern

The API client uses a **singleton pattern** to ensure only one instance exists throughout the application:

```typescript
// ✅ Correct - Use the exported instance
import { apiClient } from '@/api';
await apiClient.get('/endpoint');

// ❌ Wrong - Don't create new instances
const client = new ApiClient(); // This won't work (constructor is private)
```

## Usage

### Basic Usage

```typescript
import { apiClient } from '@/api';

// GET request (public)
const response = await apiClient.get<MyType>('/endpoint');

// GET request (requires auth)
const response = await apiClient.get<MyType>('/admin/endpoint', true);

// POST request
const response = await apiClient.post<MyType>('/endpoint', { data }, true);

// PUT request
const response = await apiClient.put<MyType>('/endpoint', { data }, true);

// PATCH request
const response = await apiClient.patch<MyType>('/endpoint', { data }, true);

// DELETE request
await apiClient.delete('/endpoint', { data }, true);

// Download file
await apiClient.downloadFile('/export', 'file.csv', true);
```

### Response Structure

All API responses follow this structure:

```typescript
{
  success: boolean;
  message?: string;
  data?: T;        // Your actual data
  errors?: any;
}
```

### Authentication

The API client automatically handles authentication:

1. **Token Storage**: Reads `adminToken` from `localStorage`
2. **Automatic Headers**: Adds `Authorization: Bearer <token>` when `requireAuth: true`
3. **Auto Logout**: On 401 errors, automatically removes token and redirects to login

```typescript
// Public endpoint (no auth)
await apiClient.get('/internships');

// Protected endpoint (requires auth)
await apiClient.get('/admin/dashboard', true);
```

## Interceptors

Interceptors allow you to modify requests or responses globally.

### Request Interceptors

Modify requests before they're sent:

```typescript
import { apiClient } from '@/api';

apiClient.addRequestInterceptor((config) => {
  // Add custom header
  config.headers = {
    ...config.headers,
    'X-Custom-Header': 'value',
  };
  return config;
});
```

### Response Interceptors

Modify responses after they're received:

```typescript
import { apiClient } from '@/api';

apiClient.addResponseInterceptor((response, data) => {
  // Log responses in development
  if (import.meta.env.DEV) {
    console.log('Response:', data);
  }
  return data;
});
```

### Built-in Interceptors

The following interceptors are set up in `main.tsx`:

- **Logging Interceptors**: Log requests/responses in development mode
- **Error Interceptor**: Handles 401/403 errors automatically

## Services Layer

Services use the API client to provide business logic:

```typescript
// services/internshipService.ts
import { apiClient } from '@/api';

export const internshipService = {
  getAll: async () => {
    const response = await apiClient.get<Internship[]>('/internships');
    return response.data || [];
  },
};
```

## Error Handling

The API client throws errors for:
- HTTP errors (status >= 400)
- Network errors
- Invalid responses

Always wrap API calls in try-catch:

```typescript
try {
  const data = await apiClient.get('/endpoint', true);
  // Use data.data
} catch (error) {
  console.error('API Error:', error);
  // Handle error
}
```

## Configuration

The API base URL is configured via environment variables:

```env
VITE_API_BASE_URL=http://localhost:3011/api
```

Access via:
```typescript
import { config } from '@/config/env';
console.log(config.apiBaseUrl);
```

## Advanced Usage

### Dynamic Base URL

```typescript
import { apiClient } from '@/api';

// Change base URL (useful for testing)
apiClient.setBaseURL('https://api.example.com');

// Get current base URL
const currentURL = apiClient.getBaseURL();
```

### Custom Headers

```typescript
// Headers are automatically added, but you can customize via interceptors
apiClient.addRequestInterceptor((config) => {
  return {
    ...config,
    headers: {
      ...config.headers,
      'X-Custom-Header': 'value',
    },
  };
});
```

## Testing

For testing, you can create a new instance:

```typescript
import { ApiClient } from '@/api';

// Create test instance
const testClient = ApiClient.getInstance('http://test-api.com');
```

## Best Practices

1. **Always use the singleton instance** - Import `apiClient` from `@/api`
2. **Use services layer** - Don't call `apiClient` directly in components
3. **Handle errors** - Always wrap API calls in try-catch
4. **Type your responses** - Use TypeScript generics: `apiClient.get<MyType>(...)`
5. **Use interceptors** - For cross-cutting concerns (logging, error handling)

## Example: Complete Service

```typescript
import { apiClient } from '@/api';
import type { ApiResponse } from '@/api';

interface MyData {
  id: number;
  name: string;
}

export const myService = {
  getAll: async (): Promise<MyData[]> => {
    try {
      const response = await apiClient.get<MyData[]>('/endpoint', true);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch data:', error);
      throw error;
    }
  },

  create: async (data: Partial<MyData>): Promise<MyData> => {
    const response = await apiClient.post<MyData>('/endpoint', data, true);
    if (!response.data) {
      throw new Error(response.message || 'Failed to create');
    }
    return response.data;
  },
};
```

