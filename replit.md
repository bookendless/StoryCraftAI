# replit.md

## Overview

This is a Japanese novel/story writing application that provides AI-assisted creative writing tools. The system guides users through a structured 6-step writing process: character development, plot creation, synopsis writing, chapter planning, episode design, and draft generation. Built as a full-stack TypeScript application with a React frontend and Express backend, it integrates Google's Gemini AI models to provide intelligent writing suggestions and content generation at each step of the creative process.

## Recent Changes (January 2025)

- **AI Migration**: Migrated all AI functions from OpenAI to Gemini API with support for models: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, gemini-1.5-flash
- **Bug Fixes**: Resolved critical issues including episode cancellation crashes, chapters scrolling problems, and character generation not saving properly
- **Version History**: Added synopsis version history system to prevent AI overwrites and allow users to restore previous versions
- **UI Updates**: Updated settings dialog to show new Gemini models, maintained #1b6e98 button text color throughout interface
- **Null Safety**: Added proper null checking throughout episode and chapter components to prevent runtime errors
- **Local Deployment**: Complete local PC deployment setup with SQLite database, Ollama local LLM integration, and Electron desktop app packaging
- **AI Enhancement**: Added character completion functionality and plot structure comparison view with side-by-side AI suggestions
- **Windows 11 Compatibility**: Fixed ES module vs CommonJS conflicts, created Windows-compatible batch files, and implemented memory storage fallback for reliable local deployment

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Cloud Database**: PostgreSQL with Drizzle ORM for type-safe database operations (Neon Database serverless)
- **Local Database**: SQLite with better-sqlite3 for offline standalone deployment
- **Schema Management**: Drizzle Kit for migrations and schema management with dual configuration support
- **Data Modeling**: Relational structure with projects containing characters, plots, synopses, chapters, episodes, and drafts

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store
- **Authentication**: Basic session-based authentication (implementation details not fully visible in provided code)

### External Dependencies

#### AI Integration
- **Cloud AI**: Gemini API with Google's latest AI models (gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, gemini-1.5-flash) for cloud-based content generation
- **Local AI**: Ollama integration supporting local LLM models (llama3.2:3b, llama3.2:7b) for offline standalone deployment
- **Content Generation**: Structured prompts in Japanese for culturally appropriate content creation including character completion, plot structure generation, and synopsis writing
- **AI Features**: Character field completion, plot structure comparison view, and comprehensive story development assistance

#### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Connect-pg-simple**: PostgreSQL session store for Express sessions

#### Development Tools
- **Cloud Development**: Replit Integration with Vite plugins for cloud development environment
- **Local Development**: Electron framework for desktop application packaging and distribution
- **Build Tools**: ESBuild for fast bundling, electron-builder for executable file creation
- **TypeScript**: Full type safety across the entire stack with dual environment support

#### UI and Styling
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for consistent iconography
- **Date-fns**: Date manipulation utilities

#### Build and Development
- **Vite**: Fast development server and build tool with React plugin
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **ESModules**: Native ES module support throughout the application