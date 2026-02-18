# External Integrations

**Analysis Date:** 2026-02-18

## APIs & External Services

**Privy Authentication:**
- Service: Privy (passwordless authentication)
- What it's used for: User authentication and wallet linking in frontend applications and server verification
- SDK/Client: `@privy-io/react-auth` (frontend), `@privy-io/server-auth` (backend)
- Configuration: `apps/server/src/config/privy.ts`
- Auth: `PRIVY_APP_ID` and `PRIVY_APP_SECRET` environment variables
- Usage: `apps/privy-login-example` and `apps/events` for user authentication

**The Graph Network (Subgraph Queries):**
- Service: The Graph Protocol for Knowledge Graph queries
- What it's used for: Querying structured entity data, spaces, and relations via GraphQL
- SDK/Client: `graphql-request` (GraphQL client)
- Endpoint: Geo Protocol subgraph (configurable)
- Usage: `packages/hypergraph/src/space/find-many-public.ts`, `packages/hypergraph/src/entity/find-many-public.ts`
- Content IDs used: System IDs from `@geoprotocol/geo-sdk` for standard properties

**Blockchain RPC (Ethereum-compatible chains):**
- Service: Geo Genesis blockchain (EVM-compatible)
- What it's used for: Reading smart contract state, submitting transactions via account abstraction
- SDK/Client: Viem (Ethereum client library)
- Default RPC: `https://rpc-geo-genesis-h0q2s21xx8.t.conduit.xyz`
- Testnet RPC: `https://rpc-geo-test-zc16z3tcvf.t.conduit.xyz`
- Chain ID: 80451 (Geo Genesis) / 19411 (Geo Testnet)
- Usage: `packages/hypergraph/src/connect/smart-account.ts` for smart account operations

**Pimlico (Account Abstraction Bundler & Paymaster):**
- Service: Pimlico - ERC-4337 bundler and gas sponsorship
- What it's used for: User operation bundling and gas fee sponsorship for account abstraction
- SDK/Client: `permissionless/clients/pimlico` (createPimlicoClient)
- Endpoint: `https://api.pimlico.io/v2/`
- API Key: Default fallback key provided (`pim_KqHm63txxhbCYjdDaWaHqH`) with limited gas budget
- Chain Support: Both Geo Genesis and Geo Testnet
- Usage: `packages/hypergraph/src/connect/smart-account.ts` for smart account client creation
- Note: The default API key is gas-limited and should be replaced with production API key

**Geo Protocol SDK:**
- Service: Geo Protocol (Knowledge Graph standard implementation)
- What it's used for: TESTNET constant definitions, entity content IDs, system property IDs
- SDK/Client: `@geoprotocol/geo-sdk` 0.9.0
- Usage: Throughout hypergraph and hypergraph-react packages for entity schema definitions
- Exports: TESTNET addresses (DAO_FACTORY_ADDRESS), ContentIds, SystemIds

## Data Storage

**Databases:**
- SQLite (primary/default)
  - Connection: `file:./dev.db` (default local file) or environment variable `DATABASE_URL`
  - Client: Prisma ORM (`@prisma/client`, `prisma`)
  - Schema: `apps/server/prisma/schema.prisma`
  - Tables: SpaceEvent, Space, SpaceKey, SpaceKeyBox, SpaceInbox, SpaceInboxMessage, Account, AppIdentity, AccountInbox, AccountInboxMessage, Invitation, InvitationTargetApp, Update

- PostgreSQL (supported alternative)
  - Connection: Via `DATABASE_URL` environment variable
  - Client: Prisma ORM
  - Prisma provider: Set to "postgresql" in schema.prisma
  - Deployment targets: Linux musl OpenSSL 3.0.x binaries available

**Local Data Storage:**
- Automerge documents (CRDT-based local-first data)
  - Client: `@automerge/automerge` and `@automerge/automerge-repo`
  - Storage: In-memory with optional persistence layer
  - Syncing: Can sync to backend via HTTP (in hypergraph-react)

**File Storage:**
- Local filesystem (images/avatars referenced via URL properties)
- No explicit S3 or cloud storage integration detected
- Avatar URLs stored as encrypted entity properties in database

**Caching:**
- React Query (TanStack React Query) for server state caching
- Automerge documents as local cache layer
- XState Store for client-side state
- No external caching service (Redis) detected

## Authentication & Identity

**Auth Provider:**
- Primary: Privy (external OAuth-like provider)
  - Implementation: `@privy-io/server-auth` integration in `apps/server/src/services/privy-auth.ts`
  - Token validation: Server verifies Privy ID tokens via PrivyClient API
  - Wallet linking: Supports linked wallet extraction from Privy user object

- Secondary: SIWE (Sign-In with Ethereum)
  - SDK: `siwe` 3.0.0
  - Usage: Message signing and verification for Ethereum identity
  - Implementation: In `packages/hypergraph/src/identity/` for self-custody authentication

**Smart Account Identity:**
- ERC-4337 Account Abstraction (Safe smart accounts)
- Smart Sessions: ERC-7579 modules with session validators (`@rhinestone/module-sdk`)
- Ownable Validator: Custom validator for smart account ownership
- Session Key Management: Session key creation and permission management in `packages/hypergraph/src/connect/smart-account.ts`

**App Identity Management:**
- Concept: Apps receive unique identities linked to user accounts
- Storage: AppIdentity table in database with encryption keys and signatures
- Session Tokens: JWT-like session tokens with expiration (`sessionToken`, `sessionTokenExpires` in AppIdentity)
- Key Material: Stored encrypted in database with signature proofs

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Rollbar integration)
- Application logs via Effect's structured logging

**Logs:**
- Structured logging via Effect platform
  - Logger: `Logger.structured` (JSON format)
  - Alternative: `Logger.pretty` (available but commented out in `apps/server/src/index.ts`)
  - Output: Console-based with optional OpenTelemetry export

**Traces:**
- Optional OpenTelemetry integration via Honeycomb
  - Service: Honeycomb.io (observability platform)
  - SDK: `@effect/opentelemetry` (OpenTelemetry with Effect)
  - Endpoint: `https://api.honeycomb.io`
  - Configuration: `apps/server/src/config/honeycomb.ts`
  - API Key: `HONEYCOMB_API_KEY` (optional, type: Redacted)
  - Service Name: `hypergraph-server`
  - Conditionally enabled only if API key is provided

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured (no vercel.json, netlify.toml detected)
- Expected targets: Vercel (Next.js), Netlify, or self-hosted Node.js

**CI Pipeline:**
- GitHub Actions (inferred from GitHub repo reference in package.json)
- Changesets for automated versioning and changelog (`@changesets/cli`)

**Build Artifacts:**
- Packages: Compiled to `dist/` directories with type declarations
- Apps: Vite apps compiled to dist, Next.js to .next
- CLI: Bundled to dist with bin entries

## Environment Configuration

**Required env vars:**
- Production (server):
  - `DATABASE_URL` - Database connection string (SQLite path or PostgreSQL URL)
  - `PRIVY_APP_ID` - Privy application ID (required for Privy integration)
  - `PRIVY_APP_SECRET` - Privy secret key (required for Privy integration, marked as Redacted)

**Optional env vars:**
- `HONEYCOMB_API_KEY` - Honeycomb API key for OpenTelemetry export (optional, type: Redacted)

**Secrets location:**
- `.env` file (loaded via `PlatformConfigProvider.layerDotEnvAdd('.env')`)
- Environment variables (platform-specific: GitHub Actions, deployment platforms)
- Sensitive values marked as `Redacted` in Effect Config for safe logging

**Configuration Precedence:**
1. Environment variables
2. `.env` file
3. Hardcoded defaults (e.g., SQLite dev.db)

## Webhooks & Callbacks

**Incoming:**
- None detected (pure HTTP REST API, no webhook receivers configured)

**Outgoing:**
- None detected in server code
- Potential future: Privy authentication callbacks, space event notifications

**Data Synchronization:**
- Automerge document sync via WebSocket (in progress - see CLAUDE.md note about WebSocket exclusion)
- GraphQL queries for data fetching (one-way pull, not push)

## Smart Contract Integration

**Chain: Geo Genesis (80451)**
- RPC: `https://rpc-geo-genesis-h0q2s21xx8.t.conduit.xyz`
- Contracts:
  - Safe Smart Account v1.4.1 (via permissionless)
  - ERC-7579 Module Manager (SAFE_7579_MODULE_ADDRESS: 0x7579EE8307284F293B1927136486880611F20002)
  - ERC-7579 Launchpad (ERC7579_LAUNCHPAD_ADDRESS: 0x7579011aB74c46090561ea277Ba79D510c6C00ff)
  - DAO Factory (space creation)
  - MainVoting (public space governance)
  - PersonalSpaceAdmin (personal space management)
  - SmartSessions validator module (session key management)

**Chain: Geo Testnet (19411)**
- RPC: `https://rpc-geo-test-zc16z3tcvf.t.conduit.xyz`
- Custom SAFE addresses deployed (different from mainnet due to module deployment status)
- Note: Smart sessions not fully deployed on testnet yet; fallback to legacy account operations

## Rate Limiting & Quotas

**The Graph Subgraph:**
- Standard Graph public subgraph query limits apply
- No explicit rate limiting configuration

**Pimlico:**
- Default API key has gas spending limits
- Production API keys should implement custom rate limiting

**Blockchain RPC:**
- Conduit chain RPC likely has rate limits
- No explicit rate limiting library detected in codebase

---

*Integration audit: 2026-02-18*
