# replit.md

## Overview

This is a **Task Management Application** with Gantt chart visualization capabilities. The project enables users to create, manage, and visualize tasks with timeline views, progress tracking, and overdue status monitoring. Built as a full-stack TypeScript application with a React frontend and Express backend, it provides both list and Gantt chart views for task management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Gantt Visualization**: gantt-task-react library
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (tsx for development)
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts`
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod schemas shared between frontend and backend via `drizzle-zod`

### Project Structure
```
├── client/           # React frontend application
│   └── src/
│       ├── components/   # UI components and feature components
│       ├── hooks/        # Custom React hooks (tasks, toast, mobile)
│       ├── lib/          # Utilities (queryClient, utils)
│       └── pages/        # Page components (Home, not-found)
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database access layer
│   └── db.ts         # Database connection
├── shared/           # Shared types and schemas
│   ├── schema.ts     # Drizzle database schema
│   └── routes.ts     # API route contracts with Zod validation
└── migrations/       # Drizzle migration files
```

### Data Flow
1. Frontend components use custom hooks from `client/src/hooks/use-tasks.ts`
2. Hooks interact with the API using TanStack Query
3. API routes in `server/routes.ts` validate input with Zod schemas from `shared/routes.ts`
4. Storage layer in `server/storage.ts` handles database operations via Drizzle ORM
5. Database schema defined in `shared/schema.ts` is shared for type safety

### Key Design Decisions
- **Shared Schema Pattern**: Database schema and validation schemas are defined in `shared/` directory, enabling type safety across the full stack
- **Storage Abstraction**: `IStorage` interface in `server/storage.ts` abstracts database operations, making it easier to swap implementations
- **Component-Based UI**: shadcn/ui components provide consistent, accessible UI primitives
- **API Contract Pattern**: Routes defined with Zod schemas ensure runtime validation matches TypeScript types

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database toolkit for TypeScript with `drizzle-kit` for migrations
- **connect-pg-simple**: PostgreSQL session store (available but sessions not currently implemented)

### Frontend Libraries
- **gantt-task-react**: Gantt chart visualization
- **date-fns**: Date manipulation and formatting
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **Lucide React**: Icon library
- **embla-carousel-react**: Carousel component

### Development Tools
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development
- **Replit Plugins**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required)