# Space Invitations

Space invitations are a way to invite other users to a space. Currently only invitations for private spaces are supported. Public space invitations are possible within GeoBrowser and will be supported in the future.

## Invite to Space

```tsx
const { inviteToSpace } = useHypergraphApp();

inviteToSpace({
  space: "space-id",
  inviteeAccountAddress: "0x1234567890123456789012345678901234567890"
});
```

## Listing Invitations

```tsx
const { listInvitations } = useHypergraphApp();

listInvitations();
```

Once the function is called the invitations are requested from and are available in the Hypergraph store.

```tsx
import { useSelector } from "@xstate/store/react";
import { store } from "@graphprotocol/hypergraph";

const invitations = useSelector(store, (state) => state.context.invitations);
```

## Accepting Invitations

```tsx
const { acceptInvitation } = useHypergraphApp();

acceptInvitation({
  invitation: "invitation-id",
});
```
