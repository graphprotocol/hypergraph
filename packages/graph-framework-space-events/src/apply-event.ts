import { secp256k1 } from '@noble/curves/secp256k1';
import { Effect, Schema } from 'effect';
import type { ParseError } from 'effect/ParseResult';
import { canonicalize, stringToUint8Array } from 'graph-framework-utils';
import type { SpaceInvitation, SpaceMember, SpaceState } from './types.js';
import { SpaceEvent, VerifySignatureError } from './types.js';

type Params = {
  state?: SpaceState;
  event: SpaceEvent;
};

const decodeSpaceEvent = Schema.decodeUnknownEither(SpaceEvent);

export const applyEvent = ({
  state,
  event: rawEvent,
}: Params): Effect.Effect<SpaceState, ParseError | VerifySignatureError> => {
  const decodedEvent = decodeSpaceEvent(rawEvent);
  if (decodedEvent._tag === 'Left') {
    return decodedEvent.left;
  }
  const event = decodedEvent.right;

  const encodedTransaction = stringToUint8Array(canonicalize(event.transaction));
  const isValidSignature = secp256k1.verify(event.author.signature, encodedTransaction, event.author.publicKey, {
    prehash: true,
  });

  if (!isValidSignature) {
    return Effect.fail(new VerifySignatureError());
  }

  let id = '';
  let members: { [signaturePublicKey: string]: SpaceMember } = {};
  let removedMembers: { [signaturePublicKey: string]: SpaceMember } = {};
  let invitations: { [id: string]: SpaceInvitation } = {};

  if (event.transaction.type === 'create-space') {
    id = event.transaction.id;
    members[event.transaction.creatorSignaturePublicKey] = {
      signaturePublicKey: event.transaction.creatorSignaturePublicKey,
      encryptionPublicKey: event.transaction.creatorEncryptionPublicKey,
      role: 'admin',
    };
  } else if (state !== undefined) {
    id = state.id;
    members = { ...state.members };
    removedMembers = { ...state.removedMembers };
    invitations = { ...state.invitations };

    if (event.transaction.type === 'delete-space') {
      removedMembers = { ...members };
      members = {};
      invitations = {};
    } else if (event.transaction.type === 'create-invitation') {
      invitations[event.transaction.id] = {
        signaturePublicKey: event.transaction.signaturePublicKey,
        encryptionPublicKey: event.transaction.encryptionPublicKey,
      };
    }
  } else {
    throw new Error('State is required for all events except create-space');
  }

  return Effect.succeed({
    id,
    members,
    removedMembers,
    invitations,
    transactionHash: '', // TODO
  });
};
