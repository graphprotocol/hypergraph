import {
  SpaceEvent,
  SpaceInvitation,
  SpaceMember,
  SpaceState,
} from "./types.js";

type Params = {
  state?: SpaceState;
  event: SpaceEvent;
};

export const applyEvent = ({ state, event: rawEvent }: Params): SpaceState => {
  // TODO parse the event
  const event = rawEvent;

  // TODO verify the event
  // - verify the signature
  // - verify that this event is based on the previous one
  // - verify versioning

  let id = "";
  let members: { [signaturePublicKey: string]: SpaceMember } = {};
  let removedMembers: { [signaturePublicKey: string]: SpaceMember } = {};
  let invitations: { [id: string]: SpaceInvitation } = {};

  if (event.transaction.type === "create-space") {
    id = event.transaction.id;
    members[event.transaction.creatorSignaturePublicKey] = {
      signaturePublicKey: event.transaction.creatorSignaturePublicKey,
      encryptionPublicKey: event.transaction.creatorEncryptionPublicKey,
      role: "admin",
    };
  } else if (state !== undefined) {
    id = state.id;
    members = { ...state.members };
    removedMembers = { ...state.removedMembers };
    invitations = { ...state.invitations };

    if (event.transaction.type === "delete-space") {
      removedMembers = { ...members };
      members = {};
      invitations = {};
    } else if (event.transaction.type === "create-invitation") {
      invitations[event.transaction.id] = {
        signaturePublicKey: event.transaction.signaturePublicKey,
        encryptionPublicKey: event.transaction.encryptionPublicKey,
      };
    }
  } else {
    throw new Error("State is required for all events except create-space");
  }

  return {
    id,
    members,
    removedMembers,
    invitations,
    transactionHash: "", // TODO
  };
};
