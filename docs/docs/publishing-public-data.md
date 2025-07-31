# Publishing Public Data

Once you want to share your data with the world you need to publish it. This is done by creating the necessary `Opertations` (Ops) and then publishing them.

There are two functions to help you with this:

- `preparePublish` - creates the necessary `Operations` to publish the data
- `publishOps` - publishes the `Operations` to the public space

You can generate the Ops for multiple entities and publish them in one go by concatenating the `ops` arrays.

## Prepare Publish

Based on entity Ids, the source space and the target space this function calculates the necessary `Operations` to publish the data.

```tsx
import { preparePublish } from "@graphprotocol/hypergraph-react";

const { ops } = preparePublish({
  entity: entity,
  publicSpace: "public-space-id",
});
```

The entity can come from a `useCreateEntity` result or from a `useQuery` result e.g.

## Publish

The `publishOps` function is used to publish the changes to the public space.

```tsx
import { publishOps } from "@graphprotocol/hypergraph-react";

const { result } = publishOps({
  ops,
  walletClient: smartSessionClient,
  space: publicSpaceId,
  name: "Create Event", // description which can be any string
});
```

Additionally, we export a `usePublishToPublishSpace` hook which abstracts the above functionality into a single function call. This function internally uses React Query's useMutate hook, so you have access to all of the same state machine and callback functions.

```tsx
import { usePublishToPublicSpace, useHypergraphApp } from "@graphprotocol/hypergraph-react";

const MyComponent = ({ publicSpaceId }: { publicSpaceId: string }) => {
  const { getSmartSessionClient } = useHypergraphApp();
  const { data: events } = useQuery(Event, { mode: "private" });
  const { mutate, isPending } = usePublishToPublicSpace();

  if (isPending) {
    return <div>Publishing...</div>
  }

  return (
    <div>
      {events.map((event) => (
        <button key={event.id} onClick={() => mutate({ entity: event, publicSpaceId })}>
          {event.name}
        </button>
      ))}
    </div>
  );
};
```

## Exploring the Knowledge Graph via GeoBrowser

In order to explore the knowledge graph you can use GeoBrowser.

Visit [https://testnet.geobrowser.io/root](https://testnet.geobrowser.io/root) and explore the knowledge graph. Once you published you can find it via the search by name or by id.

By looking up the data you also can verify that it was published correctly.
