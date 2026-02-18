# Coding Conventions

**Analysis Date:** 2026-02-18

## Naming Patterns

**Files:**
- kebab-case for all files: `geo-id.ts`, `translate-filter-to-graphql.ts`, `find-many-public.ts`
- Internal utilities marked with `internal/` prefix: `src/utils/internal/base58Utils.ts`
- Test files follow source file naming: `geo-id.ts` → `geo-id.test.ts`

**Functions:**
- camelCase for all function exports: `parseGeoId()`, `normalizeGeoId()`, `createAppIdentity()`
- Use verb-noun pattern: `createSpace()`, `deleteEntity()`, `findOne()`
- Higher-order functions use camelCase: `Entity.create(handle, Schema)`

**Variables:**
- camelCase for all variables and constants: `testKey`, `spaceId`, `mockRequest`
- UPPER_SNAKE_CASE for constants: `BASE58_ALLOWED_CHARS`, `UUID_WITH_DASHES_REGEX`
- Destructured variables use camelCase: `{ parseGeoId, normalizeGeoId }`

**Types:**
- PascalCase for all types: `GeoId`, `PublicIdentity`, `IdentityKeys`
- Branded types use PascalCase: `type GeoId = string` (semantic type)
- Type parameters use PascalCase: `<T>`, `<U>`

## Code Style

**Formatting:**
- Tool: Biome (configured via CLI flag)
- Single quotes: `'hello'` not `"hello"`
- Print width: 120 characters (set in `.prettierrc`)
- Indentation: 2 spaces (Biome default)

**Linting:**
- Tool: Biome (`@biomejs/biome` v2.2.0+)
- Run command: `pnpm lint` (check), `pnpm lint:fix` (auto-fix)
- Configuration: Root-level Biome config managed by monorepo
- Used across all packages and applications

## Import Organization

**Order:**
1. Node.js built-ins: `import * as path from 'node:path'`
2. External packages: `import { Effect } from 'effect'`, `import { Repo } from '@automerge/automerge-repo'`
3. Internal packages: `import * as Entity from '@graphprotocol/hypergraph'`
4. Local imports: `import { idToAutomergeId } from '../../src/utils/automergeId.js'`

**Path Aliases:**
- `@graphprotocol/hypergraph` → `packages/hypergraph/src`
- `@graphprotocol/hypergraph-react` → `packages/hypergraph-react/src`
- `@graphprotocol/hypergraph/test` → `packages/hypergraph/test`
- File extensions: Always use `.js` in imports (ESM): `'../../src/utils/geo-id.js'`

**Barrel Files:**
- Used extensively: `src/utils/index.ts`, `src/entity/index.ts`, `src/space/index.ts`
- Pattern: `export * from './geo-id.js'`
- Enables clean imports: `import * as Entity from '@graphprotocol/hypergraph'`

## Error Handling

**Patterns:**
- Effect library for error handling: `Effect.fail()`, `Effect.succeed()`
- Custom error types with inheritance: `InvalidIdentityError` extends `Error`
- Thrown errors with descriptive messages: `throw new Error('Invalid Geo ID (expected UUID...)')`
- Try-catch for synchronous operations, Effect for async
- No silent failures: always propagate errors upward
- Example from code:
  ```typescript
  export function parseGeoId(id: string): GeoId {
    const normalized = normalizeGeoId(id);
    if (!UUID_WITHOUT_DASHES_REGEX.test(normalized)) {
      throw new Error(`Invalid Geo ID (expected UUID with or without dashes): ${id}`);
    }
    return normalized;
  }
  ```

## Logging

**Framework:** console methods (console.log, console.error)

**Patterns:**
- Minimal logging in core library code
- Use descriptive messages for errors
- Include context when available: `console.error(\`Failed to process \${entityId}\`)`
- No structured logging framework in use

## Comments

**When to Comment:**
- JSDoc for public APIs and exported functions
- Inline comments for complex logic, workarounds, or non-obvious decisions
- TODO/FIXME comments mark known limitations (30+ scattered throughout codebase)
- Comments in test setup explain fixture creation and mocks

**JSDoc/TSDoc:**
- Used for important public exports
- Pattern:
  ```typescript
  /**
   * Hypergraph Geo IDs are UUIDs without dashes (32 hex chars).
   * Since older code and tooling may still provide UUIDs with dashes, we accept both
   * and normalize to the dashless format.
   */
  export type GeoId = string;
  ```

## Function Design

**Size:** Functions range 10-50 lines (most smaller than 25 lines)

**Parameters:**
- Prefer objects for multiple parameters: `createSpace({ author })`
- Use destructuring: `{ id, name } = entity`
- Type parameters for generics: `Entity.Schema<T>`

**Return Values:**
- Explicit return type annotations: `export function parseGeoId(id: string): GeoId`
- Effect-wrapped returns for async: `Effect.runPromise(...)`
- Early returns to reduce nesting
- Null/undefined used selectively: `Entity.findOne()` returns `undefined` for not-found

## Module Design

**Exports:**
- Namespace exports for feature modules: `import * as Entity from '...'`
- Named exports for utilities and types
- Type exports: `export type GeoId = string`
- Consistent public API per module

**Barrel Files:**
- Central index.ts in each feature directory
- Aggregates all public exports
- Simplifies imports for consumers
- Pattern: `packages/hypergraph/src/entity/index.ts` exports all entity operations

## TypeScript

**Strict Mode:**
- Enabled globally (`strict: true` in root tsconfig.json)
- No `any` type (prefer `unknown` with type guards)
- `noImplicitAny: true`, `strictNullChecks: true`
- All function parameters typed

**Type Safety Patterns:**
- Branded types for domain concepts: `type GeoId = string & { readonly __brand: 'GeoId' }`
- Discriminated unions for state machines
- Effect library for type-safe error handling
- Generic constraints: `<T extends Record<string, unknown>>`

---

*Convention analysis: 2026-02-18*
