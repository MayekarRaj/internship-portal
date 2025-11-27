# Frontend Structure

This document describes the modular structure of the frontend application.

## Directory Structure

```
internship/src/
├── api/              # API client and configuration
│   └── client.ts     # API client class with HTTP methods
├── config/           # Configuration files
│   └── env.ts        # Environment variables configuration
├── services/         # Business logic services
│   ├── authService.ts
│   ├── internshipService.ts
│   ├── applicationService.ts
│   ├── dashboardService.ts
│   ├── notesService.ts
│   └── index.ts      # Central export
├── types/            # TypeScript type definitions
│   └── index.ts
├── components/       # React components
│   ├── admin/        # Admin panel components
│   └── ui/           # Reusable UI components
├── pages/            # Page components
│   └── admin/        # Admin panel pages
├── store/            # Redux store and slices
│   └── adminAuthSlice.ts
└── App.tsx           # Main application component
```

## Module Descriptions

### API (`api/`)
- **client.ts**: Centralized API client class
  - Handles all HTTP requests (GET, POST, PUT, PATCH, DELETE)
  - Automatically adds authentication headers
  - Handles response parsing and error handling
  - Supports file downloads for exports

### Config (`config/`)
- **env.ts**: Environment variable configuration
  - Centralized access to environment variables
  - Type-safe configuration
  - Default values for development

### Services (`services/`)
Business logic layer that uses the API client:
- **authService.ts**: Authentication (login, logout, verify)
- **internshipService.ts**: Internship CRUD operations
- **applicationService.ts**: Application management
- **dashboardService.ts**: Dashboard metrics
- **notesService.ts**: Notes management

### Types (`types/`)
- **index.ts**: All TypeScript interfaces and types
  - `Internship`
  - `Application`
  - `Admin`
  - `Note`
  - `DashboardMetrics`
  - etc.

### Components (`components/`)
- **admin/**: Admin panel specific components
- **ui/**: Reusable UI components (shadcn/ui)

### Pages (`pages/`)
- **admin/**: Admin panel pages

### Store (`store/`)
- Redux slices for state management
- **adminAuthSlice.ts**: Admin authentication state

## Usage Examples

### Using Services

```typescript
import { internshipService, adminInternshipService } from '@/services';
import { applicationService } from '@/services';

// Public API
const internships = await internshipService.getAll();
const internship = await internshipService.getById(1);

// Admin API (requires authentication)
const allInternships = await adminInternshipService.getAll();
await adminInternshipService.create({ title: '...', ... });
await adminInternshipService.update(1, { title: 'Updated' });
await adminInternshipService.delete(1);

// Applications
const applications = await adminApplicationService.getAll({
  page: 1,
  limit: 10,
  status: 'pending'
});
```

### Using API Client Directly

```typescript
import { apiClient } from '@/api/client';

// GET request
const response = await apiClient.get('/endpoint', true); // true = requires auth

// POST request
const response = await apiClient.post('/endpoint', { data }, true);

// File download
await apiClient.downloadFile('/export', 'file.csv', true);
```

### Environment Variables

Create a `.env` file in the `internship` directory:

```env
VITE_API_BASE_URL=http://localhost:3011/api
VITE_APP_NAME=Getfly Technologies Internship Portal
VITE_APP_ENV=development
```

Access in code:
```typescript
import { config } from '@/config/env';
console.log(config.apiBaseUrl);
```

## Benefits

1. **Separation of Concerns**: Clear separation between API, services, and components
2. **Reusability**: Services can be used across multiple components
3. **Type Safety**: Full TypeScript support with shared types
4. **Maintainability**: Easy to find and modify specific functionality
5. **Testability**: Services can be easily mocked for testing
6. **Consistency**: All API calls go through the same client with consistent error handling

## Adding New Features

1. **New Service**: Create file in `services/` directory
2. **New Type**: Add to `types/index.ts`
3. **New Component**: Add to `components/` or `pages/`
4. **New API Endpoint**: Add method to appropriate service file

