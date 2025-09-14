# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
**Important**: Use pnpm for package management.
- `pnpm install` - Install dependencies
- `pnpm add <package>` - Add new dependency
- `pnpm remove <package>` - Remove dependency

### Build and Run
- `pnpm dev` - Start development server with hot reload ⚠️ **DO NOT USE** - Never run dev mode during development
- `pnpm start` - Run the application in production mode
- `pnpm build` - Build the project for production (outputs to ./dist)

**IMPORTANT**: Never run `pnpm dev` during development work. The development server should only be started by the user manually when they want to test the application. Use tests instead of running the dev server.

### Code Quality
- `pnpm typecheck` - Run TypeScript type checking without emitting files
- `pnpm lint` - Run Biome on all TypeScript/JavaScript files
- `pnpm lint:fix` - Run Biome with automatic fixes on all files

### Testing
- `pnpm test` - Run all tests once
- `pnpm test:watch` - Run tests in watch mode
- Uses Vitest with @effect/vitest for Effect-aware testing
- Test files: `test/**/*.test.ts` and `src/**/*.test.ts`

### Database
- `pnpm prisma generate` - Generate Prisma client
- `pnpm prisma migrate dev` - Run database migrations in development
- `pnpm prisma studio` - Open Prisma Studio GUI

**CRITICAL DEVELOPMENT RULE**: After EVERY file change, you MUST:
1. Run `pnpm lint:fix` immediately
2. Run `pnpm typecheck` immediately  
3. Fix ALL lint errors and type errors before proceeding
4. Do NOT continue development until both commands pass without errors

This is non-negotiable and applies to every single file modification.

## Project Architecture

### Technology Stack
- **Runtime**: Node.js with tsx for development
- **Language**: TypeScript with ES2022 target
- **Framework**: Effect Platform HTTP API
- **Database**: SQLite with Prisma ORM
- **Authentication**: Privy for external auth, custom session tokens for internal

### Code Style
- Uses Biome for linting and formatting (monorepo configuration)
- Line width: 120 characters, 2-space indentation
- Single quotes for JavaScript/TypeScript

### TypeScript Configuration
- Strict mode enabled
- Effect patterns preferred (Effect.fn over Effect.gen)
- No emit configuration (build handled by tsup)
- Path aliases configured: `server/*` maps to `./src/*`

### Project Structure
- `src/` - Source code directory
  - `config/` - Configuration modules
  - `http/` - HTTP API definitions and handlers
  - `services/` - Business logic services
  - `domain/` - Domain models (Effect Schema)
- `prisma/` - Database schema and migrations
- `test/` - Test files
- `specs/` - Feature specifications
- `patterns/` - Implementation patterns documentation

## Development Workflow - Spec-Driven Development

This project follows a **spec-driven development** approach where every feature is thoroughly specified before implementation.

**CRITICAL RULE: NEVER IMPLEMENT WITHOUT FOLLOWING THE COMPLETE SPEC FLOW**

### Mandatory Workflow Steps

**AUTHORIZATION PROTOCOL**: Before proceeding to any phase (2-5), you MUST:
1. Present the completed work from the current phase
2. Explicitly ask for user authorization to proceed  
3. Wait for clear user approval before continuing
4. NEVER assume permission or proceed automatically

### Phase-by-Phase Process

**Phase 1**: Create `instructions.md` (initial requirements capture)
- Create feature folder and capture user requirements
- Document user stories, acceptance criteria, constraints

**Phase 2**: Derive `requirements.md` from instructions - **REQUIRES USER APPROVAL**
- Structured analysis of functional/non-functional requirements
- STOP and ask for authorization before proceeding to Phase 3

**Phase 3**: Create `design.md` from requirements - **REQUIRES USER APPROVAL** 
- Technical design and implementation strategy
- STOP and ask for authorization before proceeding to Phase 4

**Phase 4**: Generate `plan.md` from design - **REQUIRES USER APPROVAL**
- Implementation roadmap and task breakdown  
- STOP and ask for authorization before proceeding to Phase 5

**Phase 5**: Execute implementation - **REQUIRES USER APPROVAL**
- Follow the plan exactly as specified
- NEVER start implementation without explicit user approval

## Effect TypeScript Development Patterns

### Core Principles
- **Type Safety First**: Never use `any` or type assertions - prefer explicit types
- **Effect Patterns**: Use Effect's composable abstractions (prefer Effect.fn)
- **Early Returns**: Prefer early returns over deep nesting
- **Input Validation**: Validate inputs at system boundaries with Effect Schema
- **Resource Safety**: Use Effect's resource management for automatic cleanup

### Effect-Specific Patterns

#### Sequential Operations (Effect.fn preferred)
```typescript
// Use Effect.fn for sequential operations
const program = Effect.fn(function* () {
  const user = yield* getUser(id)
  const profile = yield* getProfile(user.profileId)
  return { user, profile }
})
```

#### Error Handling
```typescript
// Use Data.TaggedError for custom errors
class UserNotFound extends Data.TaggedError("UserNotFound")<{
  readonly id: string
}> {}

// Use Effect.tryPromise for Promise integration
const fetchUser = (id: string) =>
  Effect.tryPromise({
    try: () => prisma.user.findUniqueOrThrow({ where: { id } }),
    catch: () => new UserNotFound({ id })
  })
```

#### Testing with @effect/vitest

**Use @effect/vitest for Effect code:**
- Import pattern: `import { assert, describe, it } from "@effect/vitest"`
- Test pattern: `it.effect("description", () => Effect.fn(function*() { ... }))`
- **FORBIDDEN**: Never use `expect` from vitest in Effect tests - use `assert` methods

#### Correct it.effect Pattern

```typescript
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"

describe("UserService", () => {
  it.effect("should fetch user successfully", () =>
    Effect.fn(function* () {
      const user = yield* fetchUser("123")
      
      // Use assert methods, NOT expect
      assert.strictEqual(user.id, "123")
      assert.deepStrictEqual(user.profile, expectedProfile)
      assert.isTrue(user.active)
    }))
})
```

## Implementation Patterns

The project includes comprehensive pattern documentation for future reference and consistency:

### Pattern Directory
**Location**: `patterns/`
- **Purpose**: Detailed documentation of all implementation patterns used in the project
- **Usage**: Reference material for maintaining consistency and best practices

### Available Patterns
- **http-api.md**: HTTP API definition and implementation patterns
- **layer-composition.md**: Layer-based dependency injection patterns
- **generic-testing.md**: General testing patterns with @effect/vitest

## Notes
- This is an Effect Platform HTTP API migration of the original Express server
- Focus on type safety, observability, and error handling
- WebSocket functionality excluded (to be migrated separately)
- Uses hardcoded port configuration (no portfinder)