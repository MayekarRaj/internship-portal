# Backend Structure

This document describes the modular structure of the backend API.

## Directory Structure

```
backend/src/
├── config/           # Configuration files
│   ├── database.ts   # Database connection and initialization
│   └── jwt.ts        # JWT configuration
├── controllers/       # Business logic (request handlers)
│   ├── authController.ts
│   ├── internshipController.ts
│   ├── applicationController.ts
│   └── dashboardController.ts
├── middleware/       # Express middleware
│   ├── auth.ts       # Authentication middleware
│   ├── validation.ts # Request validation
│   ├── rateLimiter.ts # Rate limiting
│   └── errorHandler.ts # Error handling
├── routes/          # Route definitions
│   ├── publicRoutes.ts  # Public API routes
│   └── adminRoutes.ts   # Admin API routes
├── types/           # TypeScript type definitions
│   └── index.ts
└── server.ts        # Main application entry point
```

## Module Descriptions

### Config (`config/`)
- **database.ts**: Database connection pool, initialization, and schema setup
- **jwt.ts**: JWT secret and expiration configuration

### Controllers (`controllers/`)
Contains all business logic and request handlers:
- **authController.ts**: Admin authentication (login, logout, verify)
- **internshipController.ts**: Internship CRUD operations (public and admin)
- **applicationController.ts**: Application submission and management
- **dashboardController.ts**: Admin dashboard metrics

### Middleware (`middleware/`)
Express middleware functions:
- **auth.ts**: `authenticateAdmin` - JWT token verification
- **validation.ts**: Request validation rules and error handling
- **rateLimiter.ts**: Rate limiting configurations
- **errorHandler.ts**: Global error and 404 handlers

### Routes (`routes/`)
Route definitions that map URLs to controllers:
- **publicRoutes.ts**: Public endpoints (no authentication required)
  - `GET /api/health`
  - `GET /api/internships`
  - `GET /api/internships/:id`
  - `POST /api/applications`
- **adminRoutes.ts**: Admin endpoints (authentication required)
  - `POST /api/admin/auth/login`
  - `GET /api/admin/auth/me`
  - `POST /api/admin/auth/logout`
  - `GET /api/admin/dashboard`
  - `GET /api/admin/internships` (all, including inactive)
  - `POST /api/admin/internships`
  - `PUT /api/admin/internships/:id`
  - `DELETE /api/admin/internships/:id`
  - `PATCH /api/admin/internships/:id/status`
  - `GET /api/admin/applications` (with filtering)
  - `GET /api/admin/applications/:id`
  - `GET /api/admin/internships/:id/applications`
  - `PATCH /api/admin/applications/:id/status`
  - `DELETE /api/admin/applications/:id`

### Types (`types/`)
TypeScript interfaces and type definitions:
- `Internship`
- `InternshipApplication`
- `Admin`
- Express Request extension for `req.admin`

### Server (`server.ts`)
Main application file that:
- Sets up Express app
- Configures middleware
- Registers routes
- Initializes database
- Starts the server

## Benefits of This Structure

1. **Separation of Concerns**: Each module has a single responsibility
2. **Maintainability**: Easy to find and modify specific functionality
3. **Testability**: Controllers and middleware can be tested independently
4. **Scalability**: Easy to add new features without cluttering
5. **Reusability**: Middleware and utilities can be reused across routes

## Adding New Features

1. **New Route**: Add to appropriate route file (`publicRoutes.ts` or `adminRoutes.ts`)
2. **New Controller**: Create file in `controllers/` directory
3. **New Middleware**: Create file in `middleware/` directory
4. **New Type**: Add to `types/index.ts`

## Environment Variables

Required environment variables:
- `PORT` - Server port (default: 3011)
- `DB_HOST` - Database host (default: localhost)
- `DB_USER` - Database user (default: root)
- `DB_PASSWORD` - Database password (default: admin)
- `DB_NAME` - Database name (default: internship_portal)
- `DB_PORT` - Database port (default: 3306)
- `FRONTEND_URL` - Frontend URL for CORS
- `JWT_SECRET` - Secret key for JWT tokens
- `ADMIN_DEFAULT_EMAIL` - Default admin email
- `ADMIN_DEFAULT_PASSWORD` - Default admin password

