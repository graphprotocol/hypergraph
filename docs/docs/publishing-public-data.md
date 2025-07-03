# Publishing Public Data

Once you want to share your data with the world you need to publish it. This is done by creating the necessary `Opertations` (Ops) and then publishing them.

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

```tsx
const MyComponent = () => {
  const { data: events } = useQuery(Event, { mode: "private" });

  const createOpsForPublishing = async (event) => {
    const { ops } = preparePublish({
      entity: event,
      publicSpace: "public-space-id",
    });
  };

  return (
    <div>
      {events.map((event) => (
        <button key={event.id} onClick={() => createOpsForPublishing(event)}>
          {event.name}
        </button>
      ))}
    </div>
  );
};
```

## Publish

The `publishOps` function is used to publish the changes to the public space. Here is a full example flow:

```tsx
import { publishOps } from "@graphprotocol/hypergraph-react";

const MyComponent = () => {
  const { getSmartSessionClient } = useHypergraphApp();

  const publishChanges = async () => {
    const smartSessionClient = await getSmartSessionClient();
    const publicSpaceId = "public-space-id";

    const { ops } = preparePublish({
      entity: entity,
      publicSpace: publicSpaceId,
    });

    const result = await publishOps({
      ops,
      walletClient: smartSessionClient,
      space: publicSpaceId,
      name: "Create Job Offers",
    });
  };
};
```

## Exploring the Knowledge Graph via GeoBrowser

In order to explore the knowledge graph you can use GeoBrowser.

Visist [https://testnet.geobrowser.io/root](https://testnet.geobrowser.io/root) and explore the knowledge graph. Once you published you can find it via the search by name or by id.

By looking up the data you also can verify that it was published correctly.