# Filtering Query Results

The filter API allows you to filter the results of a query by property values and in the future also by relations.

## Filtering by property values

```tsx
export const Event = Entity.Schema(
  { name: Type.String, cancelled: Type.Boolean },
  {
    types: [Id('event-type-id')],
    properties: { name: Id('name-property-id'), cancelled: Id('cancelled-property-id') },
  },
);

// inside the React component
const { data } = useEntities(Event, {
  filter: {
    cancelled: { is: false },
  },
});
```

The filter API supports different filters for different property types and offers a logical `or` and `not` operator.

```tsx
// boolean filter
{
  is: true/false, // exact match
  exists: true/false, // filter by existence of the property
}

// string filter
{
  is: "text", // exact match
  contains: "text",
  startsWith: "text",
  endsWith: "text",
  exists: true/false, // filter by existence of the property
}

// number filter
{
  is: 42,
  lessThan: 42,
  lessThanOrEqual: 42,
  greaterThan: 42,
  greaterThanOrEqual: 42,
  exists: true/false, // filter by existence of the property
}

// point filter
{
  is: [0, 42],
  exists: true/false, // filter by existence of the property
}

// logical `not` for a string
{
  not: {
    is: "Jane Doe",
  },
}

// logical `or` for a string
{
  or: [
    { name: "Jane Doe" },
    { name: "John Doe" },
  ],
}
```

## Filtering by entity id

When you already know the entity you want to retrieve, you can target its `id` directly.

```tsx
const { data } = useEntities(Person, {
  filter: {
    id: { is: 'fe9f0c5736824a778ef4205da3cd0a33' },
  },
});
```

This translates to the following GraphQL filter:

```
id: { is: $filterId }
```

## Combining logical filters

```tsx

{
  or: [
    not: { name: "Jane Doe" },
    not: { name: "John Doe" },
  ],
}
```

## Full examples

```tsx
// ever person except if their name is not Jane Doe or John Doe
const { data } = useEntities(Person, {
  filter: {
    or: [
      { not: { name: { is: 'Jane Doe' } } },
      { not: { name: { is: 'John Doe' } } },
    ],
  },
});

// ever person that is 42, but their name is not Jane Doe or John Doe
const { data } = useEntities(Person, {
  filter: {
    age: {
      is: 42
    },
    or: [
      { not: { name: { is: 'Jane Doe' } } },
      { not: { name: { is: 'John Doe' } } },
    ],
    not: {
      or: [
        { name: { is: "Jane Doe" } },
        { name: { is: "John Doe" } },
      ],
    },
  },
});

// every person that is not 42 years old
const { data } = useEntities(Person, {
  filter: {
    age: {
      not: { is: 42 },
    },
  },
});
```

## Relation filtering

### Filter on values of the to entity

```tsx
// schema
export const Todo = Entity.Schema(
  { name: Type.String, checked: Type.Boolean, assignees: Type.Relation(User) },
  {
    types: [Id('todo-type-id')],
    properties: {
      name: Id('name-property-id'),
      checked: Id('checked-property-id'),
      assignees: Id('assignees-property-id'),
    },
  },
);
```

1 level filtering

```tsx
const { data } = useEntities(Person, {
  filter: {
    assignees: {
      name: { is: "John" },
    },
  },
});
```

2 level filtering

```tsx
const { data } = useEntities(Person, {
  filter: {
    assignees: {
      name: { is: "John" },
      friends: {
        age: { greaterThan: 60 },
      },
    },
    includes: {
      name: {},
      description: {},
      friends: {},
    },
  },
});
```

### Filter on the relation entity

```tsx
// schema
export const Todo = Entity.Schema(
  { name: Type.String, checked: Type.Boolean, assignees: Type.Relation(User) },
  {
    types: [Id('todo-type-id')],
    properties: {
      name: Id('name-property-id'),
      checked: Id('checked-property-id'),
      assignees: Id('assignees-property-id'),
    },
  },
);
```

```tsx
const { data } = useEntities(Person, {
  filter: {
    assignees: {
      _relation: {
        entity: { assignedAt: { greaterThan: new Date("2025-01-01") } },
      },
      name: { is: "John" },
    },
  },
});
```

Note: To access the relation entity you need to use the `_relation` property.

```tsx
{
  todo.assignees.map((assignee) => (
    <span key={assignee._relation.id}>
      {assignee._relation.entity.assignedAt}
      {assignee.name}
    </span>
  ));
}
```
