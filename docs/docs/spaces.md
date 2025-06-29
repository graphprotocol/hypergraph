# Spaces

Spaces are collections of data managed by a single person or a group of people. Each space is identified by a unique ID and can be public or private.

Spaces are owned by a single person or a group of people and not by the app. This ensures data ownership stays with the owner of the space and not with the app.

## Public Spaces

Public spaces are spaces that are open to the public. They are accessible to anyone who knows the space ID.

## Private Spaces

Private spaces are spaces that are only accessible to the people who are members of the space.

## Querying Spaces

You can query spaces using the `useSpaces` hook.

### Querying Private Spaces List

```tsx
const { data, isPending } = useSpaces({ mode: "private" });
```

The query will return a list of all private spaces that the user is a member of and the information if the spaces list is still loading.

### Querying Public Spaces List

The query will return a list of all public spaces that are available to the user. The returned data is the same as the data returned by the `useQuery` hook from `@tanstack/react-query`.

```tsx
const { data, isPending, isError } = useSpaces({ mode: "public" });
```

### Querying a single private Space

```tsx
const { name, isReady, id } = useSpace({ mode: "private" });
```

The `useSpace` hook returns the name of the space and a boolean if the space is ready.

Optionally you can provide a space ID to query a specific space. By default the space ID is the one defined in the `HypergraphSpaceProvider` component.

```tsx
const { name, isReady, id } = useSpace({ mode: "private", space: "space-id" });
```

### Querying a single public Space

```tsx
const { name, isReady, id } = useSpace({ mode: "public", space: "space-id" });
```

The `useSpace` hook returns the name of the space and a boolean if the space is ready.

Optionally you can provide a space ID to query a specific space. By default the space ID is the one defined in the `HypergraphSpaceProvider` component.

```tsx
const { name, isReady, id } = useSpace({ mode: "public", space: "space-id" });
```

## Creating Spaces

Currently spaces can only be created in Geo Connect or GeoBrowser. In the future you will be able to create spaces within an app if the users provides the necessary create space permissions to the app.
