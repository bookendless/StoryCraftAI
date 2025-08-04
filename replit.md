# replit.md

## Overview

This is a Japanese novel/story writing application that provides AI-assisted creative writing tools. The system guides users through a structured 6-step writing process: character development, plot creation, synopsis writing, chapter planning, episode design, and draft generation. Built as a full-stack TypeScript application with a React frontend and Express backend, it integrates OpenAI's GPT models to provide intelligent writing suggestions and content generation at each step of the creative process.

## User Preferences

Preferred communication style: Simple, everyday language.
Communication language: Japanese

## EXE Build Process

The application is fully configured for creating Windows EXE files using Electron and Electron Builder. All necessary configuration files are in place:

### Configuration Files:
- `electron/main.js`: Main Electron process with Japanese menu system
- `electron-builder.json`: Build configuration for Windows, macOS, and Linux
- `build-electron.sh`: Automated build script

### Build Instructions:
1. Run the build script: `./build-electron.sh`
2. The EXE file will be created in the `dist-electron` folder
3. The app includes a full Japanese interface with native menu system

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design tokens and Material Design-inspired color palette
- **Form Handling**: React Hook Form with Zod validation integration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API structure with resource-based endpoints
- **Validation**: Zod schemas for request/response validation shared between client and server
- **Error Handling**: Centralized error middleware with structured error responses
- **Development**: Hot module replacement via Vite middleware integration

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Data Modeling**: Relational structure with projects containing characters, plots, synopses, chapters, episodes, and drafts

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store
- **Authentication**: Basic session-based authentication (implementation details not fully visible in provided code)

### External Dependencies

#### AI Integration
- **OpenAI API**: GPT-4 integration for content generation including character suggestions, plot development, synopsis creation, chapter planning, episode design, and draft writing
- **Content Generation**: Structured prompts in Japanese for culturally appropriate content creation

#### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Connect-pg-simple**: PostgreSQL session store for Express sessions

#### Development Tools
- **Replit Integration**: Vite plugins for Replit development environment including error modal and cartographer
- **ESBuild**: Fast bundling for production builds
- **TypeScript**: Full type safety across the entire stack

#### UI and Styling
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for consistent iconography
- **Date-fns**: Date manipulation utilities

#### Build and Development
- **Vite**: Fast development server and build tool with React plugin
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **ESModules**: Native ES module support throughout the application
- **Electron**: Desktop application framework for creating native EXE files
- **Electron Builder**: Build tool for packaging the app into distributable formats