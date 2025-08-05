# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hypergraph is a local-first framework for building web3 consumer applications that focuses on privacy-preserving apps with interoperable data using the GRC-20 standard. The project is currently in Developer Preview status.

## Common Development Commands

### Development
```bash
# Run specific apps
cd apps/events && pnpm dev      # Events demo app
cd apps/server && pnpm dev      # Backend sync server
cd apps/connect && pnpm dev     # Geo Connect auth app
```

### Testing
```bash
pnpm test                       # Run all tests with Vitest
vitest                          # Direct vitest usage
vitest run path/to/test.ts      # Run specific test file
```

### Linting & Type Checking
```bash
pnpm lint                       # Check code with Biome
pnpm lint:fix                   # Auto-fix linting issues
pnpm check                      # TypeScript type checking
```

### Database
```bash
pnpm db:migrate:dev             # Run database migrations
pnpm db:studio                  # Open Prisma Studio
```

### Building
```bash
pnpm build                      # Build all packages and apps
pnpm clean                      # Clean all build artifacts
```

## High-Level Architecture

### Monorepo Structure
- **packages/** - Core libraries
  - `hypergraph/` - Main SDK with entity management, encryption, spaces, and inboxes
  - `hypergraph-react/` - React hooks and components
- **apps/** - Complete applications
  - `server/` - Backend sync server (Express + Prisma + SQLite/PostgreSQL)
  - `events/` - Demo app showcasing the framework (Vite + React)
  - `connect/` - Geo Connect authentication app
  - `create-hypergraph/` - Project scaffolding tool
  - `next-example/` - Next.js integration example
- **docs/** - Docusaurus documentation site

### Core Architecture Patterns

1. **Local-First with CRDTs**
   - Uses Automerge for conflict-free replicated data types
   - Offline-capable with sync when online
   - Data stored locally with optional server sync

2. **Privacy-Preserving**
   - Client-side encryption/decryption
   - Uses Noble cryptographic libraries
   - Secure key management patterns

3. **Space-Based Organization**
   - User data organized in "spaces" (private/public)
   - Each space has its own encryption keys
   - Spaces can be shared with other users

4. **Identity Management**
   - Ethereum-based authentication with Privy
   - Smart account support via Permissionless

5. **Knowledge Graph (GRC-20)**
   - Structured data format for interoperability
   - Entity-based data model
   - Schema-driven development with TypeSync

### Key Technologies
- **TypeScript** with strict mode
- **Effect** for functional programming patterns
- **React** for UI applications
- **Automerge** for CRDT implementation
- **Viem** for Ethereum interactions
- **Prisma** for database ORM
- **GraphQL** for API queries
- **Biome** for linting/formatting

### Development Patterns

1. **Effect Usage**
   - Use Effect for error handling and async operations
   - Prefer functional patterns with immutable data
   - Use Effect testing utilities in tests

2. **Module Structure**
   - Each module exports clear public API
   - Use barrel exports (index.ts)
   - Separate concerns by feature

3. **Testing Strategy**
   - Tests in `./test` directories
   - Test both success and error scenarios
   - Mock external dependencies appropriately

4. **Type Safety**
   - Use branded types for domain identifiers
   - Discriminated unions for state management
   - Strict TypeScript configuration

5. **Naming Conventions**
   - snake_case for service names and API endpoints
   - camelCase for variables and functions
   - PascalCase for types and components