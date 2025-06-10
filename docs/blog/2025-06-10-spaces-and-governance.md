---
slug: grc20-spaces-and-governance
title: "5. Understanding Spaces and Governance in GRC-20"
date: 2025-06-06
series_position: 5
authors: [nik]
tags: [knowledge-graphs, education, grc20]
---

> **Series:** GRC-20 Knowledge Graph (Part 5 of 6)  
> **Previous:** [← Serialization & Encoding](/blog/grc20-serialization-and-encoding)  
> **Next:** [Best Practices →](/blog/grc20-knowledge-graph-best-practices)

The GRC-20 specification introduces the concept of **Spaces** as a way to organize and govern knowledge graphs. In this post, we'll explore how spaces work and how they enable different governance models for managing knowledge.

<!-- truncate -->

## What is a Space?

A Space in GRC-20 is a logical domain that encapsulates:
- A self-contained knowledge graph
- Governance rules and access controls
- Anchoring and versioning mechanisms

Every space has its own UUID and can be referenced by other spaces, enabling a web of interconnected knowledge while maintaining clear boundaries and control.

## Types of Spaces

GRC-20 defines three categories of spaces, each serving different needs:

### 1. Public Spaces

- **Governance**: Onchain, community-driven
- **Visibility**: Public
- **Control**: Determined by smart contracts
- **Use Cases**: 
  - Open knowledge bases
  - Community-curated datasets
  - Public standards and specifications

### 2. Personal Spaces

- **Governance**: Centralized
- **Visibility**: Public
- **Control**: Individual or organization
- **Use Cases**:
  - Personal blogs
  - Portfolio sites
  - Organization documentation

### 3. Private Spaces

- **Governance**: Local or group-based
- **Visibility**: Private
- **Control**: Device-level or encrypted sharing
- **Use Cases**:
  - Personal notes
  - Team collaboration
  - Private research

## Space Implementation

### Core Type Definition

Every space is an entity with the Space type:

```typescript
const SPACE_TYPE_UUID = "362c1dbd-dc64-44bb-a3c4-652f38a642d7"
```

### Space Hierarchy

Spaces can form hierarchies through relations:

```typescript
interface SpaceRelations {
  broaderSpaces: string[]  // Parent space UUIDs
  subspaces: string[]      // Child space UUIDs
}
```

This enables:
- Organizing knowledge in logical trees
- Inheriting governance rules
- Maintaining context across spaces

## Governance Models

### Public Space Governance

Public spaces use smart contracts to enforce:

1. **Proposal Submission**
   - Who can propose changes
   - Required stake or reputation
   - Proposal formats

2. **Voting**
   - Voting periods
   - Quorum requirements
   - Vote weight calculation

3. **Execution**
   - Automatic vs manual execution
   - Timelock periods
   - Emergency procedures

Example smart contract interface:

```solidity
interface IPublicSpace {
    function propose(bytes32 editCid, string calldata description) external;
    function vote(uint256 proposalId, bool support) external;
    function execute(uint256 proposalId) external;
    function getProposal(uint256 proposalId) external view returns (Proposal memory);
}
```

### Personal Space Controls

Personal spaces use simpler control mechanisms:

```typescript
interface PersonalSpaceControls {
    owner: string            // Controller address
    delegates?: string[]     // Optional additional writers
    readAccess: "public"     // Always public in personal spaces
    writeAccess: "owner"     // Only owner + delegates can write
}
```

### Private Space Security

Private spaces focus on encryption and sharing:

```typescript
interface PrivateSpaceConfig {
    encryptionKey: CryptoKey
    allowedMembers: string[]
    syncMode: "p2p" | "local"
    backupStrategy?: "ipfs" | "none"
}
```

## Space Creation and Evolution

### Creating a New Space

1. Generate a UUID for the space
2. Define its type (public/personal/private)
3. Set up governance structure
4. Initialize empty graph state
5. Begin accepting edits

Example creation flow:

```typescript
async function createPublicSpace(config: SpaceConfig): Promise<Space> {
    // Generate space UUID
    const spaceId = generateUuid()
    
    // Deploy governance contract
    const contract = await deploySpaceContract(config.governance)
    
    // Initialize space entity
    const space = {
        id: spaceId,
        type: SPACE_TYPE_UUID,
        contract: contract.address,
        values: [
            { property: "name", value: config.name },
            { property: "description", value: config.description }
        ]
    }
    
    // Anchor initial state
    await anchorSpace(space)
    
    return space
}
```

### Converting Existing Entities

Any entity can evolve into a space:

1. Choose the target entity
2. Deploy appropriate contracts/controls
3. Bind the entity to governance
4. Migrate existing content

```typescript
async function convertToSpace(entityId: string, config: SpaceConfig): Promise<Space> {
    // Verify entity exists
    const entity = await getEntity(entityId)
    
    // Set up governance
    const governance = await setupGovernance(config)
    
    // Add space type
    await addEntityType(entityId, SPACE_TYPE_UUID)
    
    // Bind to governance
    await bindEntityToGovernance(entityId, governance)
    
    return loadSpace(entityId)
}
```

## Cross-Space Interactions

### References

When linking across spaces:

```typescript
interface CrossSpaceReference {
    fromEntity: string
    fromSpace: string
    toEntity: string
    toSpace: string
    verified: boolean
}
```

### Trust and Verification

Spaces can mark cross-space references as verified:

```typescript
async function verifyReference(ref: CrossSpaceReference) {
    // Check if source space trusts target
    const trusted = await checkSpaceTrust(ref.fromSpace, ref.toSpace)
    
    if (trusted) {
        await markReferenceVerified(ref)
    }
}
```

## Best Practices

1. **Space Planning**
   - Choose the right space type for your use case
   - Plan governance structure before creation
   - Consider future growth and evolution

2. **Access Control**
   - Use appropriate permission levels
   - Implement proper key management
   - Regular security audits

3. **Cross-Space Relations**
   - Verify external references
   - Track space versions
   - Handle missing spaces gracefully

4. **Performance**
   - Cache frequently accessed data
   - Batch updates when possible
   - Monitor space size and growth

## Learn More

For complete details on spaces and governance in GRC-20, including protobuf schemas and smart contract interfaces, check out the [full GRC-20 specification](https://forum.thegraph.com/t/grc-20-knowledge-graph/6161).

Spaces are a powerful mechanism for organizing and controlling knowledge in GRC-20. By understanding their capabilities and choosing the right model for your needs, you can build robust and secure knowledge graph applications. 