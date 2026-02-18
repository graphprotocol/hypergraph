# Codebase Concerns

**Analysis Date:** 2026-02-18

## Tech Debt

**Network Hardcoded to Testnet:**
- Issue: Multiple files hardcode Geo Testnet endpoints and configuration; production mainnet support incomplete
- Files:
  - `packages/hypergraph/src/connect/smart-account.ts` (lines 81, 210-219, 364-372, 445-449, 470-474, 687-713, 909-915)
  - `packages/hypergraph-react/src/HypergraphAppContext.tsx` (lines 43-44)
  - `packages/hypergraph-react/src/publish-ops.ts`
  - `apps/connect/src/routes/authenticate.tsx`
- Impact: Applications cannot deploy to mainnet; all blockchain interactions use testnet configuration; gas sponsorship API key is publicly hardcoded as fallback
- Fix approach: Extract network configuration to environment variables; implement configuration switching based on deployment environment; remove hardcoded API keys

**Smart Account Module Deployment Incomplete:**
- Issue: Smart sessions validator and ERC-7579 modules not deployed on testnet; code has workarounds that add account owners instead of creating proper sessions
- Files: `packages/hypergraph/src/connect/smart-account.ts` (multiple TODO comments at lines 212, 366, 446, 470, 689, 911)
- Impact: Session functionality is currently faked on testnet by adding owners to account; this is a security workaround not suitable for production; removes granular permission model
- Fix approach: Deploy smart sessions module and ERC-7579 module on testnet; remove workaround code paths; implement proper session key management

**Entity Update Missing Optimization:**
- Issue: `findOne` function re-decodes entities from storage on every access without caching pre-decoded values
- Files: `packages/hypergraph/src/entity/findOne.ts` (lines 17-18), `packages/hypergraph/src/entity/update.ts` (lines 25, 31)
- Impact: Repeated entity access incurs decoding cost; performance degrades with large entity sets; no index-based lookups implemented
- Fix approach: Implement entity index tracking; cache decoded values in decoded-entities cache; provide opt-in pre-decoding for frequently accessed entities

**Corrupt Entity Handling Incomplete:**
- Issue: Corrupt entities detected during private entity queries are tracked but not exposed via API
- Files: `packages/hypergraph/src/entity/find-many-private.ts` (line 101), `packages/hypergraph/src/entity/decodedEntitiesCache.ts` (line 12)
- Impact: Applications cannot notify users of data integrity issues; silent failures during decode; no recovery mechanism
- Fix approach: Add API endpoint to query corrupt entity IDs by space; implement recovery/revalidation workflow; add logging for corruption detection

**Deep Merge Type Safety Bypassed:**
- Issue: Deep merge utility uses multiple `as any` type assertions due to recursive structure requirements
- Files: `packages/hypergraph/src/utils/internal/deep-merge.ts`
- Impact: Type safety lost in common utility; potential for runtime errors with malformed objects
- Fix approach: Refactor with stronger typing using discriminated unions or branded types; consider Effect Schema for validation

**Canonicalize Serialization Uses Any:**
- Issue: JSON serialization logic (`jsc.ts`) uses `as any` to handle unknown object shapes
- Files: `packages/hypergraph/src/utils/jsc.ts` (multiple locations)
- Impact: Serialization behavior undocumented for non-standard object types; no validation of toJSON implementations; potential for infinite loops if objects have circular references
- Fix approach: Add comprehensive tests for various object shapes; document expected behavior; consider using JSON schema validation

## Missing Critical Features

**Public Space Creation Removed but Not Re-implemented:**
- Issue: `Graph.createSpace` has been removed; public space creation commented out with TODO
- Files: `packages/hypergraph-react/src/HypergraphAppContext.tsx` (line 327 region)
- Impact: Applications cannot create public spaces; incomplete API migration
- Fix approach: Re-implement public space creation following new architecture; determine scope (user-facing feature or backend-only)

**Signature Verification Temporarily Disabled:**
- Issue: Message signature verification commented out in app context
- Files: `packages/hypergraph-react/src/HypergraphAppContext.tsx` (line 203)
- Impact: Security feature bypassed; messages not cryptographically verified; authentication incomplete
- Fix approach: Re-enable and test signature verification; determine reason for disable and implement properly

**Multi-level Relation Nesting Restriction Not Implemented:**
- Issue: Filtering with nested relation queries not restricted to actual relation keys; marked as TODO multiple times
- Files:
  - `packages/hypergraph/src/entity/find-many-public.ts` (line 24)
  - `packages/hypergraph/src/entity/find-one-public.ts` (line 10)
  - `packages/hypergraph/src/entity/search-many-public.ts` (line 15)
  - `packages/hypergraph-react/src/hooks/use-entities.tsx` (line 44)
  - `packages/hypergraph-react/src/internal/use-entity-public.tsx` (line 12)
- Impact: Users can request deeply nested relations that may not exist; query validation incomplete; potential N+1 query issues
- Fix approach: Implement relation key validation; limit nesting depth; add schema-aware query planning

## Fragile Areas

**State Machine Event Processing in Core Store:**
- Files: `packages/hypergraph/src/store.ts` (559 lines), `packages/hypergraph/src/store-connect.ts` (453 lines)
- Why fragile: Complex state management with multiple event types; missing update request handling (marked TODO at lines); no error recovery for incomplete syncs
- Safe modification: Add comprehensive integration tests before changes; validate event ordering assumptions; implement idempotency checks
- Test coverage: Moderate; unit tests exist but integration scenarios with failed syncs lack coverage

**Smart Account Creation and Module Installation:**
- Files: `packages/hypergraph/src/connect/smart-account.ts` (965 lines)
- Why fragile: Complex ERC-4337/ERC-7579 module installation logic with testnet workarounds; nested type assertions via @ts-expect-error; module deployment assumptions may become stale
- Safe modification: Create comprehensive test scenarios for account creation, deployment, and module installation; test legacy account upgrade path; test mainnet module compatibility before mainnet deployment
- Test coverage: Minimal for module installation; connection.test.ts lacks identity proof tests

**WebSocket Message Serialization:**
- Files: `apps/server/src/websocket.ts` (457 lines)
- Why fragile: Message serialization has TODO comment for fix; error handling marked as TODO; infoContent hardcoded empty; connection broadcasting not implemented
- Safe modification: Implement proper error handling before changes; test with various message types; validate serialization roundtrips
- Test coverage: No test coverage visible for websocket layer

**Relation Configuration Override System:**
- Files: `packages/hypergraph/src/entity/` (multiple find-many-* files with complex filtering)
- Why fragile: Complex override logic mixed with filtering; no single source of truth for relation configuration; appears in multiple files duplicated
- Safe modification: Extract relation config to centralized module; add integration tests for override scenarios
- Test coverage: relation-config-overrides.test.ts exists but coverage unclear

## Test Coverage Gaps

**Smart Account Session Creation:**
- What's not tested: Session creation flow with smart sessions module; permission ID generation; session validation on mainnet
- Files: `packages/hypergraph/src/connect/smart-account.ts`
- Risk: Critical authentication path may have bugs in mainnet deployment; session key management untested
- Priority: High

**Message Encryption/Decryption Round-trips:**
- What's not tested: Full message encryption, transmission, and decryption with various key sizes; cross-version compatibility
- Files: `packages/hypergraph/test/messages/encrypt-message.test.ts`, `decrypt-message.test.ts`
- Risk: Data loss in communication; silent decryption failures
- Priority: High

**Entity Relation Nesting Validation:**
- What's not tested: Multi-level relation filtering with invalid paths; nesting depth limits
- Files: Multiple entity query files
- Risk: Unbounded query expansion; N+1 queries in production
- Priority: High

**Corrupt Entity Recovery:**
- What's not tested: Detection and handling of corrupt entities; API exposure of corrupt entity lists; revalidation workflows
- Files: `packages/hypergraph/src/entity/find-many-private.ts`
- Risk: Silent data loss; users unaware of integrity issues
- Priority: Medium

**Server WebSocket Error Scenarios:**
- What's not tested: Connection drops; malformed messages; serialization failures; concurrent operations
- Files: `apps/server/src/websocket.ts`
- Risk: Server crashes or resource leaks under adverse conditions
- Priority: High

**Database Consistency After Failed Sync:**
- What's not tested: Partial sync failures; inconsistent state recovery; update ordering under network partitions
- Files: `packages/hypergraph/src/store.ts` and server sync handlers
- Risk: Data loss or corruption in collaborative scenarios
- Priority: Medium

## Security Considerations

**Hardcoded Gas Sponsorship API Key:**
- Risk: Publicly visible API key in source code can be rate-limited or exploited
- Files: `packages/hypergraph/src/connect/smart-account.ts` (line 73)
- Current mitigation: Key is gas-limited for early access period; only used as fallback
- Recommendations: Remove hardcoded key before production; implement per-deployment API key configuration; add monitoring for key usage/abuse

**Signature Verification Disabled:**
- Risk: Disabled signature checks mean messages are not cryptographically validated
- Files: `packages/hypergraph-react/src/HypergraphAppContext.tsx` (line 203)
- Current mitigation: None visible
- Recommendations: Re-enable immediately with proper testing; document reason for disable; add security tests for message authentication

**Session Key Management on Testnet:**
- Risk: Account owner addition as session workaround means all added keys have full account control
- Files: `packages/hypergraph/src/connect/smart-account.ts` (lines 687-713)
- Current mitigation: Only on testnet; users aware this is not production-ready
- Recommendations: Do not use testnet session workaround code in mainnet; implement proper session module before production

**Identity Ownership Proof Incomplete:**
- Risk: TODO comment suggests identity proof verification not fully implemented
- Files: `packages/hypergraph/test/identity/connect.test.ts` (line 2)
- Current mitigation: None documented
- Recommendations: Implement identity ownership verification; add test coverage for proof validation; audit authentication flow

**Type Assertions in Smart Account Module:**
- Risk: @ts-expect-error bypasses used for Rhinestone SDK compatibility; type mismatches not validated at runtime
- Files: `packages/hypergraph/src/connect/smart-account.ts` (line 722)
- Current mitigation: Comments explain missing exports
- Recommendations: Request type exports from Rhinestone SDK; add runtime validation for critical fields; test with different SDK versions

## Performance Bottlenecks

**Entity Decoding on Every Access:**
- Problem: `findOne` and related functions decode entities from storage repeatedly without caching
- Files: `packages/hypergraph/src/entity/findOne.ts`, used extensively in entity queries
- Cause: Cache exists but is not used during individual entity access; only for query results
- Improvement path: Implement shared decode result cache with invalidation; add memoization for repeated ID lookups; benchmark decode performance per entity type

**Store Event Processing Without Batching:**
- Problem: Multiple space event syncs processed individually; no batching or coalescing
- Files: `packages/hypergraph/src/store.ts` (update handling), `apps/server/src/services/spaces.ts`
- Cause: Architecture processes events as they arrive without accumulation
- Improvement path: Implement transaction batching for multiple space updates; consider write-ahead logging for server; add metrics for sync latency

**GraphQL Filter Translation Complexity:**
- Problem: Dynamic filter-to-GraphQL translation happens at query time without caching
- Files: `packages/hypergraph/src/utils/translate-filter-to-graphql.ts` (has test file but 618 line test suggests complex logic)
- Cause: No pre-compilation or caching of filter expressions
- Improvement path: Implement filter compilation/caching layer; consider pre-computing common filters; add query plan caching in server

**WebSocket Message Parsing:**
- Problem: All messages parsed through JSON deserialization and Effect Schema validation without streaming
- Files: `apps/server/src/websocket.ts` (lines 74-77)
- Cause: Entire message loaded and validated before processing; no streaming support
- Improvement path: Implement streaming JSON parser for large messages; batch message processing; add backpressure handling

## Scaling Limits

**Single Global Entity Cache:**
- Current capacity: No documented limits; entire entity set must fit in memory
- Limit: Out-of-memory when entity count exceeds available RAM
- Scaling path: Implement LRU cache with configurable size limits; add periodic cache cleanup; consider distributed cache for server deployments

**SQLite Database for Server:**
- Current capacity: Single-file SQLite; typical limits 100GB-1TB depending on workload
- Limit: Cannot scale beyond single-machine constraints; no distributed consistency
- Scaling path: Migrate to PostgreSQL for concurrent deployments; implement connection pooling; add database replication for high availability

**InFlight Updates Tracking as Array:**
- Current capacity: Unbounded array of in-flight update IDs
- Limit: Memory leak possible if updates fail to complete; no garbage collection visible
- Scaling path: Implement timeout-based cleanup for stalled updates; add metrics for in-flight count; consider bounded queue with overflow handling

**WebSocket Connections Per Server:**
- Current capacity: Node.js default event loop limits; typical 10k-100k concurrent connections
- Limit: Single server instance; no horizontal scaling
- Scaling path: Implement connection pooling; add Redis for cross-instance state; consider dedicated connection server tier

## Dependencies at Risk

**Automerge Library (Critical):**
- Risk: Automerge is core CRDT implementation; any version incompatibilities break sync
- Files: Used throughout in `packages/hypergraph/src/store.ts` and entity handling
- Impact: Breaking changes in Automerge API would require major refactoring; consider locked dependency versions
- Migration plan: Monitor Automerge releases; test upgrades thoroughly in isolated environment before applying

**Rhinestone Module SDK (High Risk):**
- Risk: SDK used for smart account module management; missing type exports require @ts-expect-error workarounds
- Files: `packages/hypergraph/src/connect/smart-account.ts`
- Impact: Type safety reduced; compatibility issues hidden from TypeScript
- Migration plan: Request type export improvements from Rhinestone; consider forking type definitions temporarily

**Permissionless/Viem (High Risk):**
- Risk: Complex blockchain interaction library; updates may introduce gas estimation changes or API breaking changes
- Files: `packages/hypergraph/src/connect/smart-account.ts` (imports from viem and permissionless)
- Impact: Transaction failures in mainnet due to gas estimation changes; breaking API changes in minor versions
- Migration plan: Pin to minor versions; test all account operations before upgrades; have rollback plan for production

**Prisma ORM (Medium Risk):**
- Risk: Generated code from schema; migrations may have edge cases
- Files: `apps/server/prisma/` schema and migrations
- Impact: Schema changes could cause production data issues
- Migration plan: Test all migrations on production-like data first; implement rollback procedures; version schema changes

## Known Bugs

**Space Subscription Cleanup Missing:**
- Symptoms: Potential memory leaks when space subscriptions change
- Files: `packages/hypergraph-react/src/internal/use-subscribe-to-space.tsx` (line 4)
- Trigger: Change space ID while subscription active; unsubscribe logic may not run
- Workaround: Remount component to trigger cleanup

**Multi-relation Changes Not Tracked in Publish:**
- Symptoms: Added or removed relations may not be published to server
- Files: `packages/hypergraph-react/src/prepare-publish.ts` (lines 81, 85, 88)
- Trigger: Create relations then publish; update relations then publish
- Workaround: Use workaround endpoints that don't involve relation changes, or manually sync

**Entity Found But Type Check Fails:**
- Symptoms: Entity exists in document but query returns undefined
- Files: `packages/hypergraph/test/entity/entity.test.ts` (line 7)
- Trigger: Unknown; test is marked with "TODO: fix this"
- Workaround: Not documented

**Delete Operation Confirmation Race:**
- Symptoms: Temporary false deletion indication before transaction confirmation
- Files: `packages/hypergraph-react/src/internal/use-delete-entity-public.tsx` (line 2)
- Trigger: Delete entity and check UI immediately; confirmation takes time
- Workaround: Wait for transaction confirmation before relying on deleted state

---

*Concerns audit: 2026-02-18*
