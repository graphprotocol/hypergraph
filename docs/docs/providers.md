# Providers

## HypergraphAppProvider

The `HypergraphAppProvider` is the main provider for the Hypergraph app. It is used to provide the app with the necessary context and state.

```tsx
import { HypergraphAppProvider } from "@graphprotocol/hypergraph-react";

const App = () => {
  return (
    <HypergraphAppProvider mapping={{}}>
      <YourApp />
    </HypergraphAppProvider>
  );
};
```

It has one mandatory prop: `mapping`. This is the mapping of your schema to the public Knowledge Graph schema. You can find more information about the mapping in the [Mapping](/docs/mapping) section later.

Further it has an optional prop: `syncServerUri`. This is the URL of the sync server. By default it is set to `https://hypergraph.fly.dev`.

## HypergraphSpaceProvider

Whenever interact with a space you need to provide the space ID. In order providing the space ID to every hook e.g. useSpace, useQuery, useCreateEntity, etc. you can use the `HypergraphSpaceProvider` to wrap a section of your app with the space ID.

```tsx
import { HypergraphSpaceProvider } from "@graphprotocol/hypergraph-react";

const Space = () => {
  // the space ID is provided by the HypergraphSpaceProvider
  const { name, id } = useSpace();
  // the space ID is provided by the HypergraphSpaceProvider
  const { data } = useQuery(Event, { mode: "private" });
  return <div>{name}</div>;
};

const SpaceDetails = () => {
  return (
    <HypergraphSpaceProvider space="space-id">
      <Space />
    </HypergraphSpaceProvider>
  );
};
```

The `space` prop is the ID of the space. It can be a private or public space.
