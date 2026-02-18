# Architecture

**Analysis Date:** 2026-02-18

## Pattern Overview

**Overall:** Modular, local-first SDK with Effects-based backend services and React integration layer

**Key Characteristics:**
- Local-first architecture with client-side CRDT storage (Automerge) and optional server sync
- Privacy-preserving with client-side encryption/decryption using Noble cryptographic libraries
- Space-based data organization with public/private separation
- Entity-relation graph model using GRC-20 standard for interoperability
- Effect-based functional programming patterns for type safety and error handling
- Monorepo with packages (SDKs), apps (complete applications), and docs

## Layers

**SDK Core (`packages/hypergraph`):**
- Purpose: Main TypeScript SDK providing local-first framework, entity management, spaces, and cryptographic operations
- Location: `packages/hypergraph/src/`
- Contains: Entity CRUD, space management, identity/authentication, inboxes, message encryption, type mapping, CLI
- Depends on: Automerge, Effect, Noble crypto libraries, geo-sdk, viem
- Used by: React hooks layer, demo apps, server

**React Integration (`packages/hypergraph-react`):**
- Purpose: React hooks and context providers wrapping SDK functionality
- Location: `packages/hypergraph-react/src/`
- Contains: HypergraphAppContext, space context, entity hooks, message hooks, publish operations
- Depends on: hypergraph SDK, React 18+, Automerge React hooks, TanStack Query
- Used by: Demo apps, example applications

**Backend Server (`apps/server`):**
- Purpose: Sync server providing WebSocket connections, space/inbox synchronization, and API
- Location: `apps/server/src/`
- Contains: Express-like HTTP API (Effect Platform), WebSocket handlers, Prisma ORM integration, service layer
- Depends on: Effect, Prisma, SQLite/PostgreSQL, hypergraph SDK
- Used by: All SDK clients for server sync when online

**Demo Applications:**
- `apps/events/` - Event management demo (Vite + React)
- `apps/privy-login-example/` - Privy authentication example
- `apps/next-example/` - Next.js integration example
- `apps/connect/` - Geo Connect authentication app

## Data Flow

**Entity Creation & Update:**
1. User calls `Entity.create()` or `Entity.update()` through React hook or SDK
2. Data is validated against Effect Schema and encoded to GRC-20 JSON format
3. Entity is stored in Automerge document (local-first storage)
4. If published to public space, server syncs via WebSocket or HTTP
5. Encryption happens client-side before server transmission

**Space Synchronization:**
1. Client creates/joins space with encryption keys
2. Space events (create, update, delete) stored locally in Automerge
3. WebSocket connection to server transmits changes when online
4. Server relays updates to other connected clients
5. Offline clients merge changes via CRDT on reconnection

**Authentication & Identity:**
1. User authenticates via Privy (Ethereum-based) or Connect protocol
2. Private signing key created locally and encrypted with user's wallet key
3. Identity persisted to storage (localStorage, secure enclave)
4. Smart account optionally deployed for account abstraction
5. Identity verified via signature recovery during operations

**Message Inbox Flow:**
1. Message created with encryption using inbox's public key
2. Sender signature added (optional, policy-dependent)
3. Message stored in space or account inbox
4. Client decrypts using private key from storage
5. Server propagates to recipient if inbox is public

## Key Abstractions

**Spaces:**
- Purpose: Isolated data containers with encryption keys and access control
- Examples: `Space.create()`, `Space.findManyPublic()`, space inboxes
- Pattern: Space has documents (Automerge handles), encryption keys, events log, inbox list
- Location: `packages/hypergraph/src/space/`

**Entities:**
- Purpose: Typed records in a space, conforming to GRC-20 schema
- Examples: `Entity.create()`, `Entity.findMany()`, `Entity.update()`
- Pattern: Type-safe CRUD with relations support, stored in Automerge, can be public/private
- Location: `packages/hypergraph/src/entity/`

**Inboxes:**
- Purpose: Message containers for communication between users/spaces
- Examples: Space inbox, account inbox, public/private inbox types
- Pattern: Contains encrypted messages, supports different auth policies (public, connected, owner-only)
- Location: `packages/hypergraph/src/inboxes/`

**Store (XState):**
- Purpose: Client state management for spaces, identities, updates, invitations
- Pattern: XState store manages async operations and side effects
- Location: `packages/hypergraph/src/store.ts`, `store-connect.ts`
- Usage: Tracks spaces loading state, pending updates, active identities

**Identity & Authentication:**
- Purpose: Manage user identity, key storage, signature recovery
- Examples: Privy auth, Connect protocol, SIWE (Sign In with Ethereum)
- Pattern: Keys encrypted locally, identity verified via signature, smart account deployment optional
- Location: `packages/hypergraph/src/identity/`, `connect/`

## Entry Points

**SDK Main:**
- Location: `packages/hypergraph/src/index.ts`
- Triggers: `import { Entity, Space, ... } from '@graphprotocol/hypergraph'`
- Responsibilities: Exports all public APIs (Entity, Space, Identity, Inboxes, Messages, etc.)

**React Provider:**
- Location: `packages/hypergraph-react/src/index.ts`
- Triggers: `<HypergraphAppProvider>` wrapping React app
- Responsibilities: Initialize SDK store, provide context to component tree, setup Automerge repo

**Server Entry:**
- Location: `apps/server/src/index.ts`
- Triggers: `pnpm dev` or production startup
- Responsibilities: Create Effect layers, wire HTTP/WebSocket handlers, start listening

**CLI Tool:**
- Location: `packages/hypergraph/src/cli/bin.ts`
- Triggers: `hypergraph` or `hg` command
- Responsibilities: Effect CLI command parsing, execute TypeSync schema operations, import/export

## Error Handling

**Strategy:** Effect-based error handling with Data.TaggedError for domain errors

**Patterns:**
- Domain errors as tagged classes: `class InvalidSpace extends Data.TaggedError("InvalidSpace")<{ reason: string }> {}`
- Promise integration via `Effect.tryPromise` with error mapper
- Stack trace preservation through Effect layers
- Logging via Effect.log at error boundaries

## Cross-Cutting Concerns

**Logging:** Effect Logger with structured output, integrates with Honeycomb for observability in server

**Validation:** Effect Schema for runtime validation at SDK boundaries, GRC-20 encoding/decoding

**Authentication:** Multi-strategy support (Privy, SIWE, Connect), identity key storage, signature verification

**Encryption:** Client-side encryption using Noble libraries, keys stored encrypted locally, Automerge-compatible serialization

**Type Safety:** TypeScript strict mode, branded types for identifiers, schema-driven entity types

---

*Architecture analysis: 2026-02-18*
