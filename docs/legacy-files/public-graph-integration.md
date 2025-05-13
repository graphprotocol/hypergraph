# Public Graph Integration

## API flavours

- Query only private data
- Query only public data
- Query both combined where based on options you can choose how they are combined e.g.
  - private data first (when you editing something at the moment)
  - latest update

## Public Graph API

Ideally the public graph API should match the local one. On the other hand it has different behavior

```ts
const { isPending, isError, error, data, isFetching } = useQuery(Todo)
```

### GraphQL Endpoint

- GraphiQL: https://kg.thegraph.com/graphiql

## Mappings file

```ts
const mappings = {
  Person: { // matches the local type name
    typeIds: ['xyz'], // matches the public type ID
    spaceId: 'abc', // matches the public space ID
    properties: {
      name: 'gfd',
      email: 'asd',
      isAttending: { id: 'opi', reverseId: 'opi2', to: 'Event' },
    }
  },
  Event: {
    typeIds: ['xyz'], // matches the public type ID
    spaceId: 'abc', // matches the public space ID
    properties: {
      name: 'asd',
      attendees: { id: 'opi2', reverseId: 'opi1', to: 'Person' },
    },
  },
};
```

```tsx
<HypergraphAppProvider mappings={mappings}>
  <App />
</HypergraphAppProvider>
```

useQuery(Todo) would automatically use the mapping based on the name

It then constructs a query based on the mappings and queries the public graph API.

## Alternative approach

- Use a GraphQL client e.g. urql or Apollo
