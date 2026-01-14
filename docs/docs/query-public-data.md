# Query Public Data

Based on your schema, you can query public data that you created using Hypergraph. It works very much like [querying private data](/docs/query-private-data).

## Fetching public spaces

When you only need the list of public spaces (with optional avatar metadata) you can call the lower-level `Space.findManyPublic` helper directly in any Node/Edge environment, or use the `usePublicSpaces` hook inside React components. Both helpers expose the parsed space list (`data`) as well as any records that failed schema validation (`invalidSpaces`) so you can surface misconfigured entries during development.

### `usePublicSpaces`

```tsx
import { usePublicSpaces } from '@graphprotocol/hypergraph-react';

const { data: spaces, invalidSpaces, isPending } = usePublicSpaces({
  filter: { editorId: '0x1234...' },
});
```

The hook wraps the same finder in React Query, so you also inherit caching, refetching, and loading state management. Omit `filter` to list every public space that is indexed by the Geo testnet.

### `Space.findManyPublic`

```ts
import { Space } from '@graphprotocol/hypergraph';

const { data, invalidSpaces } = await Space.findManyPublic();
```

You can restrict the result set to spaces where a given account is a member or an editor with the mutually exclusive `filter` options:

```ts
await Space.findManyPublic({
  filter: { memberId: '23kd4...' },
});

await Space.findManyPublic({
  filter: { editorId: '23kd4...' },
});
```

## useEntities

In order to query public data, you need to pass in the schema type and set the mode to `public`.

```ts
import { useEntities } from '@graphprotocol/hypergraph-react';
import { Event } from '../schema';

const { data, isPending, isError } = useEntities(Event, { mode: 'public' });
```

### Including Relations

By default only non-relation properties are included in the query entries. In order to include relations, you can use the `include` parameter.

```ts
const { data, isPending, isError } = useEntities(Event, {
  mode: 'public',
  include: { sponsors: {} },
});
```

For deeper relations you can use the `include` parameter multiple levels deep. Currently two levels of relations are supported for public data.

#### Controlling include scopes with `_config`

Each branch within `include` can optionally carry a `_config` object that lets you override which spaces Hypergraph will inspect for the relation edges and the related entity values. When you omit `_config`, the query automatically reuses the `space`/`spaces` selection you passed to `useEntities`, `useEntity`, `Entity.findOnePublic`, `Entity.findManyPublic` and `Entity.searchManyPublic` helpers.

```ts
const { data: project } = useEntity(Project, {
  id: '9f1306618c3f4db79bdc3ce69631c5ef',
  mode: 'public',
  space: '3f32353d3b274a13b71a746f06e1f7db',
  include: {
    contributors: {
      _config: {
        relationSpaces: ['3f32353d3b274a13b71a746f06e1f7db', '95a4a1ccbfcc4038b7a102c513d27700'],
        valueSpaces: 'all',
      },
      organizations: {
        _config: {
          valueSpaces: ['95a4a1ccbfcc4038b7a102c513d27700'],
        },
      },
    },
  },
});
```

- `relationSpaces` controls which spaces are searched for the relation edges themselves (`relations`/`backlinks`). Pass an array to whitelist specific spaces, `'all'` to drop the filter entirely, or `[]` if you intentionally want the branch to match nothing.
- `valueSpaces` applies the same override to the `valuesList` lookups for the related entities. This lets you fetch relation edges from one space while trusting the canonical values that live in another.

Each nested branch can have its own `_config` settings, so you can attach `_config` anywhere within the two supported include levels. Mix and match the settings per branch to stitch together data that spans multiple public spaces without issuing separate queries.

### Accessing space IDs

Public entities can live in multiple spaces. Set `includeSpaceIds: true` on `useEntities`, `useEntity`, `Entity.findOnePublic`, `Entity.findManyPublic`, or `Entity.searchManyPublic` whenever you want the response entities to include a normalized (no `null` entries) `spaceIds: string[]` array. The flag defaults to `false` so responses stay small unless you opt in.

#### `useEntities`

```tsx
const { data: projects } = useEntities(Project, {
  mode: 'public',
  space: '3f32353d3b274a13b71a746f06e1f7db',
  includeSpaceIds: true,
});

projects.forEach((project) => {
  console.log(project.id, project.spaceIds); // => ["3f3235...", "95a4a1..."]
});
```

#### `useEntity`

```tsx
const { data: project } = useEntity(Project, {
  id: '9f1306618c3f4db79bdc3ce69631c5ef',
  mode: 'public',
  space: '3f32353d3b274a13b71a746f06e1f7db',
  includeSpaceIds: true,
});

console.log(project?.spaceIds); // => ["3f3235..."]
```

#### `Entity.findOnePublic`

```ts
const project = await Entity.findOnePublic(Project, {
  id: '9f1306618c3f4db79bdc3ce69631c5ef',
  space: '3f32353d3b274a13b71a746f06e1f7db',
  includeSpaceIds: true,
});

console.log(project?.spaceIds); // => ["3f3235...", "95a4a1..."]
```

#### `Entity.findManyPublic`

```ts
const { data: rounds } = await Entity.findManyPublic(InvestmentRound, {
  spaces: ['3f32353d3b274a13b71a746f06e1f7db', '95a4a1ccbfcc4038b7a102c513d27700'],
  includeSpaceIds: true,
});

rounds.map((round) => ({
  id: round.id,
  spaceIds: round.spaceIds,
}));
```

#### `Entity.searchManyPublic`

```ts
const { data: searchMatches } = await Entity.searchManyPublic(Project, {
  query: 'hypergraph',
  space: '3f32353d3b274a13b71a746f06e1f7db',
  includeSpaceIds: true,
});

console.log(searchMatches[0]?.spaceIds); // => ["3f3235..."]
```

### Querying from a specific space

You can also query from a specific space by passing in the `space` parameter.

```ts
const { data: spaceAData } = useEntities(Event, { mode: 'public', space: 'space-a-id' });
const { data: spaceBData } = useEntities(Event, { mode: 'public', space: 'space-b-id' });
```

### Filtering

You can filter the data by passing in the `filter` parameter.

```ts
const { data, isPending, isError } = useEntities(Event, { mode: 'public', filter: { name: 'John' } });
```

Please learn more about filtering in the [Filtering query results](#filtering-query-results) section.

### Returned data

useEntities for public data returns:

- data - a list of entities defined in your schema
- invalidEntities - each entry includes the invalid raw payload (`raw`) plus the corresponding `error` explaining why decoding failed
- invalidRelationEntities - each entry includes the invalid raw payload (`raw`) plus the corresponding `error` explaining why decoding failed
- isPending - a boolean indicating if the query is loading
- isError - a boolean indicating if the query failed

In addition you have access to the full response from `@tanstack/react-query`'s `useQuery` hook, which is used internally to query the public data.

```ts
const { data, invalidEntities, invalidRelationEntities, isPending, isError } = useEntities(Event, { mode: 'public' });
```

## Fetching a single public entity

When you only need a single entity—for example to power a detail page—you can stay within React by calling `useEntity`, or drop down to the SDK-level helper `Entity.findOnePublic` for server-side scripts and non-React environments.

### `useEntity`

```tsx
import { useEntity } from '@graphprotocol/hypergraph-react';
import { Project } from '../schema';

const { data: project, invalidEntity, invalidRelationEntities, isPending, isError } = useEntity(Project, {
  id: '9f1306618c3f4db79bdc3ce69631c5ef',
  space: '3f32353d3b274a13b71a746f06e1f7db',
  mode: 'public',
  include: {
    contributors: {},
  },
});
```

### `Entity.findOnePublic`

```ts
import { Entity } from '@graphprotocol/hypergraph';
import { Project } from '../schema';

const project = await Entity.findOnePublic(Project, {
  id: '9f1306618c3f4db79bdc3ce69631c5ef',
  space: '3f32353d3b274a13b71a746f06e1f7db',
  include: {
    contributors: {},
  },
});
```

## Querying Public Data from Geo Testnet using useQuery

The Geo testnet contains public data that you can query immediately without any authentication. This section provides examples to quickly explore the available data.

**Note**:

- **No authentication required** for public data queries.
- All examples below use the Geo testnet space ID: `3f32353d3b274a13b71a746f06e1f7db`

Each section below includes the relevant `schema.ts` and a query example.

### Projects Example

**Schema Definition:**

```typescript
// app/schema.ts
import { Entity, Type, Id } from "@graphprotocol/hypergraph";

export const Project = Entity.Schema(
  { name: Type.String, description: Type.optional(Type.String), xUrl: Type.optional(Type.String) },
  {
    types: [Id('484a18c5030a499cb0f2ef588ff16d50')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      description: Id('9b1f76ff9711404c861e59dc3fa7d037'),
      x: Id('0d6259784b3c4b57a86fde45c997c73c'),
    },
  },
);
```

**Query Example:**

```tsx
"use client";

import { useState } from "react";
import { useEntities } from "@graphprotocol/hypergraph-react";
import { Project } from "../schema";

export default function ProjectsExample() {
  const [limit, setLimit] = useState(40);
  const {
    data: projects,
    isPending,
    isError,
  } = useEntities(Project, {
    mode: "public",
    space: "3f32353d3b274a13b71a746f06e1f7db",
    first: limit,
  });

  if (isPending) return <div>Loading projects...</div>;
  if (isError) return <div>Error loading projects</div>;

  return (
    <div>
      <h2>Projects</h2>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <h3>
              Name: {project.name} 
            </h3>
            {project.description && (
              <p>Description: {project.description}</p>
            )}
             {project.x && (
                <a href={project.x} target="_blank" rel="noopener noreferrer">
                 View on X
                </a>
              )}
          </li>
        ))}
      </ul>
      {projects.length >= limit && (
        <div>
          <button
            onClick={() => setLimit((n) => n + 40)}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
```

### dApps Example

**Schema Definition:**

```typescript
// app/schema.ts
import { Entity, Type } from "@graphprotocol/hypergraph";

export const Dapp = Entity.Schema(
  { name: Type.String, description: Type.optional(Type.String), xUrl: Type.optional(Type.String), githubUrl: Type.optional(Type.String) },
  {
    types: [Id('8ca136d0698a4bbfa76b8e2741b2dc8c')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      description: Id('9b1f76ff9711404c861e59dc3fa7d037'),
      x: Id('0d6259784b3c4b57a86fde45c997c73c'),
      github: Id('9eedefa860ae4ac19a04805054a4b094'),
    },
  },
);
```

**Query Example:**

```tsx
"use client";

import { useState } from "react";
import { useEntities } from "@graphprotocol/hypergraph-react";
import { Dapp } from "../schema";

export default function DappsExample() {
  const [limit, setLimit] = useState(40);
  const {
    data: dapps,
    isPending,
    isError,
  } = useEntities(Dapp, {
    mode: "public",
    space: "3f32353d3b274a13b71a746f06e1f7db",
    first: limit,
  });

  if (isPending) return <div>Loading dApps...</div>;
  if (isError) return <div>Error loading dApps</div>;

  return (
    <div>
      <h2>dApps</h2>
      <ul>
        {dapps.map((dapp) => (
          <li key={dapp.id}>
            <h3>Name: {dapp.name}</h3>
            {dapp.description && (
              <p>Description: {dapp.description}</p>
            )}
            <div>
              {dapp.x && (
                <a href={dapp.x} target="_blank" rel="noopener noreferrer">
                  View on X
                </a>
              )}
              {dapp.github && (
                <a href={dapp.github} target="_blank" rel="noopener noreferrer">
                  {' '}
                  GitHub
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
      {dapps.length >= limit && (
        <div>
          <button
            onClick={() => setLimit((n) => n + 40)}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
```

### Investment Rounds Example

**Schema Definition:**

```typescript
// app/schema.ts
import { Entity, Type, Id } from "@graphprotocol/hypergraph";

export const Investor = Entity.Schema(
  { name: Type.String },
  {
    types: [Id('331aea18973c4adc8f53614f598d262d')],
    properties: { name: Id('a126ca530c8e48d5b88882c734c38935') },
  },
);

export const FundingStage = Entity.Schema(
  { name: Type.String },
  {
    types: [Id('8d35d2173fa14686b74ffcb3e9438067')],
    properties: { name: Id('a126ca530c8e48d5b88882c734c38935') },
  },
);

export const InvestmentRound = Entity.Schema(
  {
    name: Type.String,
    raisedAmount: Type.optional(Type.Number),
    investors: Type.Relation(Investor),
    fundingStages: Type.Relation(FundingStage),
    raisedBy: Type.Relation(Project),
  },
  {
    types: [Id('8f03f4c959e444a8a625c0a40b1ff330')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      raisedAmount: Id('16781706dd9c48bf913ecdf18b56034f'),
      investors: Id('9b8a610afa35486ea479e253dbdabb4f'),
      fundingStages: Id('e278c3d478b94222b2725a39a8556bd2'),
      raisedBy: Id('b4878d1a0609488db8a6e19862d6b62f'),
    },
  },
);
```

**Query Example:**

```tsx
"use client";

import { useState } from "react";
import { useEntities } from "@graphprotocol/hypergraph-react";
import { InvestmentRound } from "../schema";

export default function InvestmentRoundsExample() {
  const [limit, setLimit] = useState(40);
  const {
    data: investmentRounds,
    isPending,
    isError,
  } = useEntities(InvestmentRound, {
    mode: "public",
    space: "3f32353d3b274a13b71a746f06e1f7db",
    first: limit,
    include: {
      investors: {},
      fundingStages: {},
    },
  });

  if (isPending) return <div>Loading investment rounds...</div>;
  if (isError) return <div>Error loading investment rounds</div>;

  return (
    <div>
      <h2>Investment Rounds</h2>
      <ul>
        {investmentRounds.map((round) => (
          <li key={round.id}>
            <h3>Name: {round.name}</h3>

            {round.raisedAmount && (
              <p>
                Amount Raised: ${round.raisedAmount?.toLocaleString()}
              </p>
            )}

            {round.fundingStages.length > 0 && (
              <p>
                Stage:{" "}
                {round.fundingStages.map((stage) => stage.name).join(", ")}
              </p>
            )}

            {round.investors.length > 0 && (
              <div>
                <p>Investors:</p>
                <ul>
                  {round.investors.map((investor) => (
                    <li key={investor.id}>{investor.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
      {investmentRounds.length >= limit && (
        <div>
          <button
            onClick={() => setLimit((n) => n + 40)}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
```

### Assets Example

**Schema Definition:**

```typescript
// app/schema.ts
import { Entity, Type, Id } from "@graphprotocol/hypergraph";

export const Asset = Entity.Schema(
  { name: Type.String, symbol: Type.optional(Type.String), blockchainAddress: Type.optional(Type.String) },
  {
    types: [Id('f8780a80c2384a2a96cb567d88b1aa63')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      symbol: Id('ace1e96c9b8347b4bd331d302ec0a0f5'),
      blockchainAddress: Id('56b5944ff05948d1b0fa34abe84219da'),
    },
  },
);
```

**Query Example:**

```tsx
"use client";

import { useState } from "react";
import { useEntities } from "@graphprotocol/hypergraph-react";
import { Asset } from "../schema";

export default function AssetMarketExample() {
  const [limit, setLimit] = useState(40);
  const {
    data: assets,
    isPending,
    isError,
  } = useEntities(Asset, {
    mode: "public",
    space: "3f32353d3b274a13b71a746f06e1f7db",
    first: limit,
  });

  if (isPending) return <div>Loading assets...</div>;
  if (isError) return <div>Error loading assets</div>;

  return (
    <div>
      <h2>Assets</h2>
      <div>
        {assets.map((asset) => (
          <div key={asset.id}>
            <h3>Name: {asset.name}</h3>

            {asset.symbol && <p>Symbol: {asset.symbol}</p>}

            {asset.blockchainAddress && (
              <p>
                Address: {asset.blockchainAddress}
              </p>
            )}
          </div>
        ))}
      </div>
      {assets.length >= limit && (
        <div>
          <button
            onClick={() => setLimit((n) => n + 40)}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
```
