# Writing Private Data

There are serveral ways to write private data to the Hypergraph.

## Creating Entities

You can create entities using the `useCreateEntity` hook.

```tsx
const createEvent = useCreateEntity(Event);

createEvent({
  name: "Event 1",
  description: "Event 1 description",
});
```

For relations you can provide a list of IDs of the entities you want to relate to.

```tsx
createEvent({
  name: "Event 1",
  description: "Event 1 description",
  sponsors: ["sponsor-id-1", "sponsor-id-2"],
});
```

A common pattern is to create a new entity and then relate it to an existing entity.

```tsx
const createCompany = useCreateEntity(Company);
const createEvent = useCreateEntity(Event);

const company = createCompany({
  name: "Company 1",
});
const event = createEvent({
  name: "Event 1",
  description: "Event 1 description",
  sponsors: [company.id],
});
```

Optionally you can provide a space ID to create an entity in a specific space.

```tsx
const createEvent = useCreateEntity(Event, { space: "space-id" });
```

## Updating Entities

You can update entities using the `useUpdateEntity` hook.

```tsx
const updateEvent = useUpdateEntity(Event);

updateEvent({
  id: "event-id",
  name: "Event 1",
});
```

Note: You can't update relations using the `useUpdateEntity` hook. It is only possible to update the properties of the entity.

Optionally you can provide a space ID to update an entity in a specific space.

```tsx
const updateEvent = useUpdateEntity(Event, { space: "space-id" });
```

## Deleting Entities

You can delete entities using the `useDeleteEntity` hook.

```tsx
const deleteEvent = useDeleteEntity();

deleteEvent({
  id: "event-id",
});
```

Optionally you can provide a space ID to delete an entity in a specific space.

```tsx
const deleteEvent = useDeleteEntity({ space: "space-id" });
```

## Adding Relations (not yet supported)

TBD

## Updating Relations (not yet supported)

TBD

## Removing Relations (not yet supported)

TBD
