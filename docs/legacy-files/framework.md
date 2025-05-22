## High level overview

A space is a series of events. Separate from that we have the actual space content which can be a snapshot and updates.

We map one Automerge document to one space. This simplifies the managing the data, but comes at the cost that a space with lot's of updates might get very big. In the future we can look into splitting the space into multiple documents. This could be defined as part of the schema or some other configuration.

Updates are encrypted and signed by the author and then sent to the server. The server verifies the signature and then sends the update to all the members of the space. Once we use smart contracts the server will also send the update to the blockchain and return the verifiable confirmation to the client.

## Interactions

In order to create, manage and delete spaces we need the following space events:

- createSpace
- deleteSpace
- createInvite
- acceptInvite
- removeInvite
- updateMember
- removeMember

Separate from these we need to discover and sync the spaces the user is part of:

- listSpaces
- getSpace
- sendUpdate
- sendCompactedUpdate

Auth

- createIdentity
- restoreIdentity

I believe these actions should be independent from the transport layer, but initially would built them on top of Websocket. This way we can easily have real-time updates without a lot of retry logic.

Some of the events have a lastKnownSpaceEventId. This is to ensure that the client has the latest state of the space. If the client doesn't have the latest state, the server should return an error or if the client is behind it should discard the event and retry syncing.

### createSpace

Params:

- eventId: string
- spaceId: string
- ciphertext: string
- nonce: string
- memberSignaturePublicKey: string
- memberEncryptionPublicKey: string
- keyBox: { ciphertext: string, recipientPublicKey: string, authorPublicKey: string }
- signature of the combined data: string

### deleteSpace

Params:

- eventId: string
- spaceId: string
- signature of the combined data: string

### createInvite

Params:

- eventId: string
- spaceId: string
- invitationKeysCiphertext: string
- invitationKeysNonce: string
- invitationSignaturePublicKey: string
- invitationEncryptionPublicKey: string
- lastKnownSpaceEventId: string
- signature of the combined data: string

### acceptInvite

Params:

- eventId: string
- spaceId: string
- memberSignaturePublicKey: string
- memberEncryptionPublicKey: string
- signature of the combined data using the invitationSignaturePublicKey: string
- signature of the combined data using the member public key: string

### removeInvite

This should trigger a key rotation for the group and therefor a new spaceKey is created which should be used for all further encryptions.

Params:

- eventId: string (automatically becomes the spaceKeyId)
- spaceId: string
- inviteId: string
- lastKnownSpaceEventId: string
- keyBox: { ciphertext: string, recipientPublicKey: string, authorPublicKey: string }
- signature of the combined data: string

### updateMember

Can only be done by space admins.

Params:

- eventId: string
- spaceId: string
- memberSignaturePublicKey: string
- role: "editor" | "admin"

### removeMember

Params:

- eventId: string (automatically becomes the spaceKeyId)
- spaceId: string
- memberSignaturePublicKey: string
- lastKnownSpaceEventId: string
- keyBoxes: { ciphertext: string, recipientPublicKey: string, authorPublicKey: string }[]
- signature of the combined data: string

### listSpaces

No Params
Returns a list of space Ids and the remove event for the ones that have been removed. The client then can connect get each space separately.

### getSpace

When using a Websocket this is the first thing that should automatically happen on connect.

This might be useful to have as a HTTP endpoint as well.

### sendUpdate

Params:

- eventId: string
- ciphertext: string
- nonce: string
- spaceId: string
- spaceKeyId: string
- signature of the combined data: string

### sendCompactedUpdate

SecSync has the capability to create "Snapshots" of a space. I believe we should go with a simpler approach and allow clients to compact these events for faster loading of a space. Can be a simple algorithm that ever 200 events a client creates a snapshot for all the past events. In the future we can even optimize this by splitting them into smaller chunks so clients don't have to download all events or the snapshot and can get smaller chunks of the data

Params:

- eventId: string
- snapshotUntilEventId: string
- ciphertext: string
- nonce: string
- spaceId: string
- spaceKeyId: string
- signature of the combined data: string

## Authentication and Authorization

Authentication is handled through Privy cookies. Authorization for the actions is handled by verifying the signature of the event. The server should only accept events that are signed by the user that is part of the space.

## API

### Authentication and Authorization

```tsx
const { authenticated } = usePrivy();
```

```tsx
import {
  createSpace,
  acceptInvite,
  createSpace,
  listSpaces,
} from "@graphprotocol/hypergraph";

export const {
  SpaceProvider,
  // schema
  useCreateEntity,
  useDeleteEntity,
  useSpaceId,
  createDocumentId,
  useQuery,
  // space utils
  createInvite,
  removeInvite,
  updateMember,
  removeMember,
  deleteSpace,
  listSpaces,
  getSpace,
} = createFunctions(schema, {
  endpoint: "http://localhost:3000/sync",
});

// automatically connects to the server
<SpaceProvider id={spaceId} account={account} />;

listSpaces({ account });
getSpace({ account, spaceId });
acceptInvite({ account, spaceId, inviteKey });
```

## Questions

- Do we want to use a blockchain to manage space/invite/member events?
- Can we ensure a linear order of events using an L2 chain or can multiple events end up in a block? If so should we then sort them or can we argue only one is valid?
- When submitting an event to the chain. How long do we usually need to wait on an L2 chain before there is enough certainty that the event is part of the chain?
- Can we aggregate data on the server, send it down and verify that it's correct? Or would we need all the events and how can we verify that the server didn't leave out some?
- Do we want to leverage IPFS for storing data?
