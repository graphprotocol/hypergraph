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

Each section below includes the relevant schema definition followed by a working query example.

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

**Query Example:**

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@graphprotocol/hypergraph-react";
import { Project } from "../schema";

const LIMIT = 20;

export default function ProjectsExample() {
  const [limit, setLimit] = useState(LIMIT);
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
      <h2 className="text-xl font-bold mb-4">Projects</h2>
      <ul>
        {projects.map((project) => (
          <li key={project.id} className="mb-2 p-2 border rounded">
            <h3 className="font-bold">{project.name}</h3>
            {project.description && (
              <p className="text-gray-600">{project.description}</p>
            )}
            {project.xUrl && (
              <a
                href={project.xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                View on X
              </a>
            )}
          </li>
        ))}
      </ul>
      {projects.length >= limit && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setLimit((n) => n + LIMIT)}
            className="px-6 py-2 bg-blue-600 text-white rounded"
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

**Query Example:**

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@graphprotocol/hypergraph-react";
import { Dapp } from "../schema";

const LIMIT = 20;

export default function DappsExample() {
  const [limit, setLimit] = useState(LIMIT);
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
      <h2 className="text-xl font-bold mb-4">dApps</h2>
      <ul>
        {dapps.map((dapp) => (
          <li key={dapp.id} className="mb-2 p-2 border rounded">
            <h3 className="font-bold">{dapp.name}</h3>
            {dapp.description && (
              <p className="text-gray-600">{dapp.description}</p>
            )}
            <div className="flex gap-2 mt-2">
              {dapp.xUrl && (
                <a
                  href={dapp.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  View on X
                </a>
              )}
              {dapp.githubUrl && (
                <a
                  href={dapp.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  GitHub
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
      {dapps.length >= limit && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setLimit((n) => n + LIMIT)}
            className="px-6 py-2 bg-blue-600 text-white rounded"
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

**Query Example:**

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@graphprotocol/hypergraph-react";
import { InvestmentRound } from "../schema";

const LIMIT = 20;

export default function InvestmentRoundsExample() {
  const [limit, setLimit] = useState(LIMIT);
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
      <h2 className="text-xl font-bold mb-4">Investment Rounds</h2>
      <ul>
        {investmentRounds.map((round) => (
          <li key={round.id} className="mb-4 p-4 border rounded">
            <h3 className="font-bold text-lg">{round.name}</h3>

            {round.raisedAmount && (
              <p className="text-green-600 font-semibold">
                Amount Raised: ${round.raisedAmount?.toLocaleString()}
              </p>
            )}

            {round.fundingStages.length > 0 && (
              <p className="text-gray-600">
                Stage:{" "}
                {round.fundingStages.map((stage) => stage.name).join(", ")}
              </p>
            )}

            {round.investors.length > 0 && (
              <div className="mt-2">
                <strong>Investors:</strong>
                <ul className="ml-4 list-disc">
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
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setLimit((n) => n + LIMIT)}
            className="px-6 py-2 bg-blue-600 text-white rounded"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
```

### Asset Markets Example

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

**Query Example:**

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@graphprotocol/hypergraph-react";
import { Asset } from "../schema";

const LIMIT = 20;

export default function AssetMarketExample() {
  const [limit, setLimit] = useState(LIMIT);
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
      <h2 className="text-xl font-bold mb-4">Asset Market</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <div key={asset.id} className="p-4 border rounded-lg">
            <h3 className="font-bold">{asset.name}</h3>

            {asset.symbol && <p className="text-gray-600">{asset.symbol}</p>}

            {asset.blockchainAddress && (
              <p className="text-xs text-gray-500 mt-2 font-mono break-all">
                Address: {asset.blockchainAddress}
              </p>
            )}
          </div>
        ))}
      </div>
      {assets.length >= limit && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setLimit((n) => n + LIMIT)}
            className="px-6 py-2 bg-blue-600 text-white rounded"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
```
