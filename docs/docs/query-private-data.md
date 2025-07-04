# Query Private Data

Based on your schema, you can query private data that you created using Hypergraph.

## useQuery

In order to query private data, you need to pass in the schema type and set the mode to `private`.

```ts
import { useQuery } from '@graphprotocol/hypergraph-react';
import { Event } from '../schema';

const { data } = useQuery(Event, { mode: 'private' });
```

### Including Relations

By default only non-relation properties are included in the query entries. In order to include relations, you can use the `include` parameter.

```ts
const { data } = useQuery(Event, {
  mode: 'private',
  include: { sponsors: {} },
});
```

For deeper relations you can use the `include` parameter multiple levels deep. Currently for private data only one level of relations is supported.

### Querying from a specific space

You can also query from a specific space by passing in the `spaceId` parameter.

```ts
const { data: spaceAData } = useQuery(Event, { mode: 'private', spaceId: 'space-a-id' });
const { data: spaceBData } = useQuery(Event, { mode: 'private', spaceId: 'space-b-id' });
```

### Filtering

You can filter the data by passing in the `filter` parameter.

```ts
const { data } = useQuery(Event, { mode: 'private', filter: { name: 'John' } });
```

Please learn more about filtering in the [Filtering query results](#filtering-query-results) section.

### Returned data

useQuery for private data returns:

- data - a list of entities defined in your schema
- invalidEntities - a list of entities that are in your space storage with correct type, but can't be parsed to your schema
- deleted - a list of entities that are marked as deleted, we keep them around to be able to later be able to publish the deleted information to the public knowledge graph

```ts
const { data, invalidEntities, deleted } = useQuery(Event, { mode: 'private' });
```
