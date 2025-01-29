import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { Effect, Schema } from 'effect';
import type { ParseError } from 'effect/ParseResult';
import { canonicalize, stringToUint8Array } from '../utils/index.js';
import { hashEvent } from './hash-event.js';
import {
  InvalidEventError,
  SpaceEvent,
  type SpaceInvitation,
  type SpaceMember,
  type SpaceState,
  VerifySignatureError,
} from './types.js';

type Params = {
  state: SpaceState | undefined;
  event: SpaceEvent;
};

const decodeSpaceEvent = Schema.decodeUnknownEither(SpaceEvent);

export const applyEvent = ({
  state,
  event: rawEvent,
}: Params): Effect.Effect<SpaceState, ParseError | VerifySignatureError | InvalidEventError> => {
  const decodedEvent = decodeSpaceEvent(rawEvent);
  if (decodedEvent._tag === 'Left') {
    return decodedEvent.left;
  }
  const event = decodedEvent.right;

  if (event.transaction.type !== 'create-space') {
    if (state === undefined) {
      return Effect.fail(new InvalidEventError());
    }
    if (event.transaction.previousEventHash !== state.lastEventHash) {
      return Effect.fail(new InvalidEventError());
    }
  }

  const encodedTransaction = stringToUint8Array(canonicalize(event.transaction));

  let signatureInstance = secp256k1.Signature.fromCompact(event.author.signature.hex);
  signatureInstance = signatureInstance.addRecoveryBit(event.author.signature.recovery);
  // @ts-expect-error
  const authorPublicKey = signatureInstance.recoverPublicKey(sha256(encodedTransaction));
  // TODO compare it to the public key from the author accountId (this already verifies the signature)
  // in case of a failure we return Effect.fail(new VerifySignatureError());

  // biome-ignore lint/correctness/noConstantCondition: wip
  if (false) {
    return Effect.fail(new VerifySignatureError());
  }

  let id = '';
  let members: { [accountId: string]: SpaceMember } = {};
  let removedMembers: { [accountId: string]: SpaceMember } = {};
  let invitations: { [id: string]: SpaceInvitation } = {};

  if (event.transaction.type === 'create-space') {
    id = event.transaction.id;
    members[event.transaction.creatorAccountId] = {
      accountId: event.transaction.creatorAccountId,
      role: 'admin',
    };
  } else if (state !== undefined) {
    id = state.id;
    members = { ...state.members };
    removedMembers = { ...state.removedMembers };
    invitations = { ...state.invitations };

    if (event.transaction.type === 'accept-invitation') {
      // is already a member
      if (members[event.author.accountId] !== undefined) {
        return Effect.fail(new InvalidEventError());
      }

      // find the invitation
      const result = Object.entries(invitations).find(
        ([, invitation]) => invitation.inviteeAccountId === event.author.accountId,
      );
      if (!result) {
        return Effect.fail(new InvalidEventError());
      }
      const [id, invitation] = result;

      members[invitation.inviteeAccountId] = {
        accountId: invitation.inviteeAccountId,
        role: 'member',
      };
      delete invitations[id];
      if (removedMembers[event.author.accountId] !== undefined) {
        delete removedMembers[event.author.accountId];
      }
    } else {
      // check if the author is an admin
      if (members[event.author.accountId]?.role !== 'admin') {
        return Effect.fail(new InvalidEventError());
      }

      if (event.transaction.type === 'delete-space') {
        removedMembers = { ...members };
        members = {};
        invitations = {};
      } else if (event.transaction.type === 'create-invitation') {
        if (members[event.transaction.inviteeAccountId] !== undefined) {
          return Effect.fail(new InvalidEventError());
        }
        for (const invitation of Object.values(invitations)) {
          if (invitation.inviteeAccountId === event.transaction.inviteeAccountId) {
            return Effect.fail(new InvalidEventError());
          }
        }

        invitations[event.transaction.id] = {
          inviteeAccountId: event.transaction.inviteeAccountId,
        };
      } else {
        throw new Error('State is required for all events except create-space');
      }
    }
  }

  return Effect.succeed({
    id,
    members,
    removedMembers,
    invitations,
    lastEventHash: hashEvent(event),
  });
};
