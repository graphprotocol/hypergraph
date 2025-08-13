# Query Public Data

Based on your schema, you can query public data that you created using Hypergraph. It works very much like [querying private data](/docs/query-private-data).

## useQuery

In order to query private data, you need to pass in the schema type and set the mode to `public`.

```ts
import { useQuery } from '@graphprotocol/hypergraph-react';
import { Event } from '../schema';

const { data, isPending, isError } = useQuery(Event, { mode: 'public' });
```

### Including Relations

By default only non-relation properties are included in the query entries. In order to include relations, you can use the `include` parameter.

```ts
const { data, isPending, isError } = useQuery(Event, {
  mode: 'public',
  include: { sponsors: {} },
});
```

For deeper relations you can use the `include` parameter multiple levels deep. Currently two levels of relations are supported for public data.

### Querying from a specific space

You can also query from a specific space by passing in the `space` parameter.

```ts
const { data: spaceAData } = useQuery(Event, { mode: 'public', space: 'space-a-id' });
const { data: spaceBData } = useQuery(Event, { mode: 'public', space: 'space-b-id' });
```

### Filtering

You can filter the data by passing in the `filter` parameter.

```ts
const { data, isPending, isError } = useQuery(Event, { mode: 'public', filter: { name: 'John' } });
```

Please learn more about filtering in the [Filtering query results](#filtering-query-results) section.

### Returned data

useQuery for private data returns:

- data - a list of entities defined in your schema
- invalidEntities - a list of entities that are in your space storage with correct type, but can't be parsed to your schema
- isPending - a boolean indicating if the query is loading
- isError - a boolean indicating if the query failed

In addition you have access to the full response from `@tanstack/react-query`'s `useQuery` hook, which is used internally to query the public data.

```ts
const { data, isPending, isError } = useQuery(Event, { mode: 'public' });
```

## Querying Public Data from Geo Testnet using useQuery

The Geo testnet contains public data that you can query immediately without any authentication. This section provides examples to quickly explore the available data.

**Note**:

- **No authentication required** for public data queries.
- All examples below use the Geo testnet space ID: `b2565802-3118-47be-91f2-e59170735bac`

Each section below includes the relevant `schema.ts`, `mapping.ts`, and a query example.

### Projects Example

**Schema Definition:**

```typescript
// app/schema.ts
import { Entity, Type } from "@graphprotocol/hypergraph";

export class Project extends Entity.Class<Project>("Project")({
  name: Type.String,
  description: Type.optional(Type.String),
  xUrl: Type.optional(Type.String),
}) {}
```

**Mapping Definition:**

```typescript
// app/mapping.ts
import type { Mapping } from '@graphprotocol/hypergraph';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping.Mapping = {
  Project: {
    typeIds: [Id('484a18c5-030a-499c-b0f2-ef588ff16d50')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
      xUrl: Id('0d625978-4b3c-4b57-a86f-de45c997c73c'),
    },
  },
};
```

**Query Example:**

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@graphprotocol/hypergraph-react";
import { Project } from "../schema";

export default function ProjectsExample() {
  const [limit, setLimit] = useState(40);
  const {
    data: projects,
    isPending,
    isError,
  } = useQuery(Project, {
    mode: "public",
    space: "b2565802-3118-47be-91f2-e59170735bac",
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
             {project.xUrl && (
                <a href={project.xUrl} target="_blank" rel="noopener noreferrer">
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

export class Dapp extends Entity.Class<Dapp>("Dapp")({
  name: Type.String,
  description: Type.optional(Type.String),
  xUrl: Type.optional(Type.String),
  githubUrl: Type.optional(Type.String),
}) {}
```

**Mapping Definition:**

```typescript
// app/mapping.ts
import type { Mapping } from '@graphprotocol/hypergraph';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping.Mapping = {
  Dapp: {
    typeIds: [Id('8ca136d0-698a-4bbf-a76b-8e2741b2dc8c')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
      xUrl: Id('0d625978-4b3c-4b57-a86f-de45c997c73c'),
      githubUrl: Id('9eedefa8-60ae-4ac1-9a04-805054a4b094'),
    },
  },
};
```

**Query Example:**

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@graphprotocol/hypergraph-react";
import { Dapp } from "../schema";

export default function DappsExample() {
  const [limit, setLimit] = useState(40);
  const {
    data: dapps,
    isPending,
    isError,
  } = useQuery(Dapp, {
    mode: "public",
    space: "b2565802-3118-47be-91f2-e59170735bac",
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
              {dapp.xUrl && (
                <a
                  href={dapp.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on X
                </a>
              )}
              {dapp.githubUrl && (
                <a href={dapp.githubUrl} target="_blank" rel="noopener noreferrer">
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
import { Entity, Type } from "@graphprotocol/hypergraph";

export class Investor extends Entity.Class<Investor>("Investor")({
  name: Type.String,
}) {}

export class FundingStage extends Entity.Class<FundingStage>("FundingStage")({
  name: Type.String,
}) {}

export class InvestmentRound extends Entity.Class<InvestmentRound>(
  "InvestmentRound"
)({
  name: Type.String,
  raisedAmount: Type.optional(Type.Number),
  investors: Type.Relation(Investor),
  fundingStages: Type.Relation(FundingStage),
}) {}
```

**Mapping Definition:**

```typescript
// app/mapping.ts
import type { Mapping } from '@graphprotocol/hypergraph';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping.Mapping = {
  Investor: {
    typeIds: [Id('331aea18-973c-4adc-8f53-614f598d262d')],
    properties: { name: Id('a126ca53-0c8e-48d5-b888-82c734c38935') },
  },
  FundingStage: {
    typeIds: [Id('8d35d217-3fa1-4686-b74f-fcb3e9438067')],
    properties: { name: Id('a126ca53-0c8e-48d5-b888-82c734c38935') },
  },
  InvestmentRound: {
    typeIds: [Id('8f03f4c9-59e4-44a8-a625-c0a40b1ff330')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      raisedAmount: Id('16781706-dd9c-48bf-913e-cdf18b56034f'),
    },
    relations: {
      investors: Id('9b8a610a-fa35-486e-a479-e253dbdabb4f'),
      fundingStages: Id('e278c3d4-78b9-4222-b272-5a39a8556bd2'),
      raisedBy: Id('b4878d1a-0609-488d-b8a6-e19862d6b62f'),
    },
  },
};
```

**Query Example:**

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@graphprotocol/hypergraph-react";
import { InvestmentRound } from "../schema";

export default function InvestmentRoundsExample() {
  const [limit, setLimit] = useState(40);
  const {
    data: investmentRounds,
    isPending,
    isError,
  } = useQuery(InvestmentRound, {
    mode: "public",
    space: "b2565802-3118-47be-91f2-e59170735bac",
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
import { Entity, Type } from "@graphprotocol/hypergraph";

export class Asset extends Entity.Class<Asset>("Asset")({
  name: Type.String,
  symbol: Type.optional(Type.String),
  blockchainAddress: Type.optional(Type.String),
}) {}
```

**Mapping Definition:**

```typescript
// app/mapping.ts
import type { Mapping } from '@graphprotocol/hypergraph';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping.Mapping = {
  Asset: {
    typeIds: [Id('f8780a80-c238-4a2a-96cb-567d88b1aa63')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      symbol: Id('ace1e96c-9b83-47b4-bd33-1d302ec0a0f5'),
      blockchainAddress: Id('56b5944f-f059-48d1-b0fa-34abe84219da'),
    },
  },
};

```

**Query Example:**

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@graphprotocol/hypergraph-react";
import { Asset } from "../schema";

export default function AssetMarketExample() {
  const [limit, setLimit] = useState(40);
  const {
    data: assets,
    isPending,
    isError,
  } = useQuery(Asset, {
    mode: "public",
    space: "b2565802-3118-47be-91f2-e59170735bac",
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
