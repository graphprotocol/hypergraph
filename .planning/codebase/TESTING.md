# Testing Patterns

**Analysis Date:** 2026-02-18

## Test Framework

**Runner:**
- Vitest 3.2.4+
- Config: `vitest.config.ts` (root), shared via `vitest.shared.ts`
- Each package/app can extend shared config: `mergeConfig(shared, config)`

**Assertion Library:**
- Vitest built-in expect: `import { expect } from 'vitest'`

**Run Commands:**
```bash
pnpm test                       # Run all tests across monorepo
vitest                          # Run with watch mode (in package directory)
vitest run path/to/test.ts      # Run specific test file
pnpm test -- --coverage         # With coverage
```

## Test File Organization

**Location:**
- Co-located in `./test` directories at package level: `packages/hypergraph/test/`, `apps/events/test/`
- Tests mirror source structure: `src/utils/geo-id.ts` → `test/utils/geo-id.test.ts`
- Separate test directory per major subsystem: `test/entity/`, `test/utils/`, `test/space/`

**Naming:**
- Pattern: `[feature-name].test.ts` or `[component].test.ts`
- Examples: `geo-id.test.ts`, `entity.test.ts`, `prepare-publish.test.ts`

**Structure:**
```
packages/hypergraph/test/
├── entity/
│   ├── entity.test.ts
│   ├── findMany.test.ts
│   ├── find-one-public.test.ts
│   └── space-ids-types.test.ts
├── utils/
│   ├── geo-id.test.ts
│   ├── automergeId.test.ts
│   ├── jsc.test.ts
│   └── translate-filter-to-graphql.test.ts
├── space/
│   └── find-many-public.test.ts
└── messages/
    ├── decrypt-message.test.ts
    ├── encrypt-message.test.ts
    └── signed-update-message.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, expect, it } from 'vitest';

describe('geo-id', () => {
  it('parses and normalizes dashed UUIDs to dashless geo ids', () => {
    expect(parseGeoId('1e5e39da-a00d-4fd8-b53b-98095337112f'))
      .toBe('1e5e39daa00d4fd8b53b98095337112f');
  });

  it('GeoIdSchema decodes to normalized dashless format', () => {
    const decoded = Schema.decodeSync(GeoIdSchema)(
      '1e5e39da-a00d-4fd8-b53b-98095337112f'
    );
    expect(decoded).toBe('1e5e39daa00d4fd8b53b98095337112f');
  });
});
```

**Patterns:**
- Setup: Use `beforeEach()` for test-specific initialization:
  ```typescript
  let repo: Repo;
  let handle: DocHandle<Entity.DocumentContent>;

  beforeEach(() => {
    repo = new Repo({});  // Reset to new instance
    const result = repo.findWithProgress<Entity.DocumentContent>(automergeDocId);
    handle = result.handle;
    handle.doneLoading();
  });
  ```

- Teardown: Use `afterEach()` for cleanup:
  ```typescript
  afterEach(() => {
    vi.clearAllMocks();  // Clear vitest mocks
  });
  ```

- Assertion pattern: `expect(actual).toBe(expected)`, `expect(result).toEqual(...)`
- Error testing: `expect(() => { ... }).toThrow()`
- Async testing: `async ()` with `await` or Effect chain

## Mocking

**Framework:** Vitest `vi` module

**Patterns:**
```typescript
// Mock external modules
vi.mock('graphql-request', () => ({
  default: vi.fn(),
  gql: vi.fn((strings: TemplateStringsArray) => strings.join('')),
}));

const mockRequest = vi.mocked(request);

// Setup mock responses
beforeEach(() => {
  mockRequest.mockResolvedValue({
    entity: null,
  });
});

// Clear mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});

// Assert mock was called
expect(mockRequest).toHaveBeenCalledWith(
  `${Config.getApiOrigin()}/graphql`,
  expect.any(String),
  { entityId: entity.id, spaceId: publicSpaceId }
);
```

**What to Mock:**
- External service calls (GraphQL, APIs)
- File system operations (in CLI tests)
- Network requests
- External library functions that are difficult to test directly

**What NOT to Mock:**
- Core entity/space operations
- Encryption/decryption functions (test with real values)
- Data transformation utilities
- Effect library operations (use Effect.runPromise for async testing)

## Fixtures and Factories

**Test Data:**
```typescript
// Entity schema definition used across tests
const Person = Entity.Schema(
  {
    name: Type.String,
    age: Type.Number,
  },
  {
    types: [Id('bffa181ea333495b949c57f2831d7eca')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      age: Id('a427183d35194c96b80a5a0c64daed41'),
    },
  },
);

// Test helper for building GraphQL responses
const buildValueEntry = (
  propertyId: string,
  value: Partial<{
    text: string;
    boolean: boolean;
    float: number;
  }> = {},
) => ({
  propertyId,
  text: value.text ?? '',
  boolean: value.boolean ?? false,
  float: value.float ?? 0,
});
```

**Location:**
- Defined at top of test file or in shared test utilities
- Schemas and entity types defined locally per test suite
- No centralized fixture factory pattern currently in use

## Coverage

**Requirements:** Not enforced (no coverage threshold)

**Configuration:**
- Provider: v8 (set in `packages/create-hypergraph/vitest.config.ts`)
- Coverage config present but not enforced

**View Coverage:**
```bash
vitest run --coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual functions and utilities
- Approach: Test pure functions with various inputs
- Examples: `geo-id.test.ts`, `base58.test.ts`, `automergeId.test.ts`
- Pattern: Simple input → output assertions

**Integration Tests:**
- Scope: Entity operations within Automerge Repo context
- Approach: Setup Repo instance, test create/read/update/delete flows
- Examples: `entity.test.ts`, `prepare-publish.test.ts`
- Pattern: Setup fixtures → execute operations → assert state changes
- Includes mocked external calls (GraphQL, file system)

**E2E Tests:**
- Framework: Not used (skipped tests with `describe.skip`)
- CLI testing uses Effect + shell execution simulation: `packages/create-hypergraph/test/Cli.test.ts` is skipped but shows integration approach

## Common Patterns

**Async Testing with Effect:**
```typescript
it('should create a space state', async () => {
  const getVerifiedIdentity = (accountAddress: string, publicKey: string) => {
    if (accountAddress === author.accountAddress && publicKey === author.signaturePublicKey) {
      return Effect.succeed(author as PublicIdentity);
    }
    return Effect.fail(new InvalidIdentityError());
  };

  const state = await Effect.runPromise(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });
      return yield* applyEvent({ event: spaceEvent, state: undefined, getVerifiedIdentity });
    }),
  );

  expect(state.id).toBeTypeOf('string');
  expect(state.members).toEqual({ ... });
});
```

**Effect-based Testing:**
```typescript
// From @effect/vitest integration
it.effect('happy path - scaffolds app with all options provided', () =>
  Effect.gen(function* () {
    const tempDir = yield* createTempDir();
    const output = yield* run([...args], tempDir);
    expect(output).toContain('Successfully scaffolded');
    yield* cleanupTempDir(tempDir);
  }),
);
```

**Error Testing:**
```typescript
// Synchronous errors
it('should throw an error if attempting to update an entity that does not exist', () => {
  expect(() => {
    Entity.update(handle, Person)('person_dne', { name: 'does not exist' });
  }).toThrowError();
});

// Validation errors
it('should throw NaNNotAllowedError for NaN values', () => {
  expect(() => canonicalize(Number.NaN)).toThrow(NaNNotAllowedError);
});

// Async error rejection
it('should handle GraphQL request failures', async () => {
  mockRequest.mockRejectedValue(new Error('Network error'));
  await expect(preparePublish(params)).rejects.toThrow('Network error');
});
```

**Skipped Tests:**
```typescript
// Mark test as pending/skipped
it.skip('should handle entities with relations', async () => {
  // Implementation incomplete
});

// Skip entire suite
describe.skip('create-hypergraph CLI', () => {
  // All tests skipped
});
```

**Test Variations with Loops:**
```typescript
it('should handle optional Number field variations', async () => {
  const testCases = [
    { value: 0, description: 'zero' },
    { value: -15.5, description: 'negative decimal' },
    { value: undefined, description: 'undefined' },
  ];

  for (const testCase of testCases) {
    const entity = { ... };
    const result = await preparePublish(params);
    expect(result.ops).toBeDefined();
  }
});
```

**Nested Describe Blocks:**
```typescript
describe('Entity', () => {
  describe('create', () => {
    it('should create an entity in the repo', () => { ... });
  });

  describe('update', () => {
    it('should update an existing entity', () => { ... });
  });

  describe('delete', () => {
    it('should delete a created entity', () => { ... });
  });
});
```

## Test Configuration Files

**Root Config:** `vitest.config.ts`
- Defines multi-project setup
- Projects: `./packages/*`, `./apps/events`, `./apps/connect`, `./apps/server`, `./apps/privy-login-example`

**Shared Config:** `vitest.shared.ts`
- Path aliases for imports: `@graphprotocol/hypergraph` → `packages/hypergraph/src`
- Applied to all packages via `mergeConfig()`

**Package-level Overrides:** `packages/*/vitest.config.ts`
- Most packages extend shared config
- Some add specific settings: `packages/create-hypergraph/vitest.config.ts` adds:
  - `globals: true` (global test functions)
  - `testTimeout: 10000` (10s per test)
  - Coverage provider: v8

## Testing Best Practices Observed

1. **Isolation:** Each test resets shared state (new Repo instance per `beforeEach`)
2. **Clarity:** Descriptive test names: `it('parses and normalizes dashed UUIDs to dashless geo ids')`
3. **Completeness:** Test both success and error paths (see entity.test.ts)
4. **No Test Interdependence:** Tests run independently, no shared test data
5. **Async Handling:** Proper use of `async/await` and Effect chains
6. **Mock Verification:** Assert that mocks were called correctly, not just return values

---

*Testing analysis: 2026-02-18*
