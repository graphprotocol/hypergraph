# Providers

## HypergraphAppProvider

The `HypergraphAppProvider` is the main provider for the Hypergraph app. It is used to provide the app with the necessary context and state.

```tsx
import { HypergraphAppProvider } from "@graphprotocol/hypergraph-react";

const App = () => {
  return (
    <HypergraphAppProvider>
      <YourApp />
    </HypergraphAppProvider>
  );
};
```

It has an optional prop: `syncServerUri`. This is the URL of the sync server. By default it is set to `https://sync.geobrowser.io`.

## useHypergraphApp

The `useHypergraphApp` is available inside the `HypergraphAppProvider` and manages the sync server connection and provides several useful functions.

```tsx
import { useHypergraphApp } from "@graphprotocol/hypergraph-react";

const App = () => {
  const { isConnecting, logout } = useHypergraphApp();
  return <div>{isConnecting ? "Connecting..."}</div>;
};
```

- `isConnecting` is a boolean that indicates that syncing private spaces is not yet possible. You need to wait until it's `false` to query data from private spaces.
- `logout` is a function that logs out the user.

There are several more that will be explained in the following sections.

## useHypergraphAuth

The `useHypergraphAuth` is available inside the `HypergraphAppProvider` and manages the authentication state and provides several useful functions.

```tsx
import { useHypergraphAuth } from "@graphprotocol/hypergraph-react";

const App = () => {
  const { authenticated, identity } = useHypergraphAuth();
  return <div>{authenticated ? "Authenticated" : "Not authenticated"}</div>;
};
```

- `authenticated` is a boolean that indicates if the user is authenticated.
- `identity` is the identity of the logged in user.

## HypergraphSpaceProvider

Whenever you interact with a space you need to provide the space ID. Instead of providing the space ID to every hook e.g. useSpace, useEntities, useEntity, useCreateEntity, etc. you can use the `HypergraphSpaceProvider` to wrap a section of your app with the space ID.

```tsx
import { HypergraphSpaceProvider, useSpace, useEntities } from "@graphprotocol/hypergraph-react";

const Space = () => {
  // the space ID is provided by the HypergraphSpaceProvider
  const { name, id } = useSpace();
  // the space ID is provided by the HypergraphSpaceProvider
  const { data } = useEntities(Event, { mode: "private" });
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

