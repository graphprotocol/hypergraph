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

### Filtering (not yet supported)

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
