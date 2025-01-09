import { secp256k1 } from '@noble/curves/secp256k1';
import { Effect, Schema } from 'effect';
import type { ParseError } from 'effect/ParseResult';

import { hexToBytes } from '../utils/hexBytesAddressUtils.js';
import { canonicalize } from '../utils/jsc.js';
import { stringToUint8Array } from '../utils/stringToUint8Array.js';

import { hashEvent } from './hash-event.js';
import {
  InvalidEventError,
  SpaceEvent,
  type SpaceInvitation,
  type SpaceMember,
  type SpaceState,
  VerifySignatureError,
} from './types.js';

const decodeSpaceEvent = Schema.decodeUnknownEither(SpaceEvent);

export type ApplyEventParams = {
  state: SpaceState | undefined;
  event: SpaceEvent;
};
export const applyEvent = ({
  state,
  event: rawEvent,
}: ApplyEventParams): Effect.Effect<SpaceState, ParseError | VerifySignatureError | InvalidEventError> => {
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

  const isValidSignature = secp256k1.verify(
    event.author.signature,
    encodedTransaction,
    hexToBytes(event.author.publicKey),
    {
      prehash: true,
    },
  );

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
      accountId: event.transaction.creatorAccountId,
      signaturePublicKey: event.transaction.creatorSignaturePublicKey,
      encryptionPublicKey: event.transaction.creatorEncryptionPublicKey,
      role: 'admin',
    };
  } else if (state !== undefined) {
    id = state.id;
    members = { ...state.members };
    removedMembers = { ...state.removedMembers };
    invitations = { ...state.invitations };

    if (event.transaction.type === 'accept-invitation') {
      // is already a member
      if (members[event.author.publicKey] !== undefined) {
        return Effect.fail(new InvalidEventError());
      }

      // find the invitation
      const result = Object.entries(invitations).find(
        ([, invitation]) => invitation.signaturePublicKey === event.author.publicKey,
      );
      if (!result) {
        return Effect.fail(new InvalidEventError());
      }
      const [id, invitation] = result;

      members[event.author.publicKey] = {
        accountId: event.author.accountId,
        signaturePublicKey: event.author.publicKey,
        encryptionPublicKey: invitation.encryptionPublicKey,
        role: 'member',
      };
      delete invitations[id];
      if (removedMembers[event.author.publicKey] !== undefined) {
        delete removedMembers[event.author.publicKey];
      }
    } else {
      // check if the author is an admin
      if (members[event.author.publicKey]?.role !== 'admin') {
        return Effect.fail(new InvalidEventError());
      }

      if (event.transaction.type === 'delete-space') {
        removedMembers = { ...members };
        members = {};
        invitations = {};
      } else if (event.transaction.type === 'create-invitation') {
        if (members[event.transaction.signaturePublicKey] !== undefined) {
          return Effect.fail(new InvalidEventError());
        }
        for (const invitation of Object.values(invitations)) {
          if (invitation.signaturePublicKey === event.transaction.signaturePublicKey) {
            return Effect.fail(new InvalidEventError());
          }
        }

        invitations[event.transaction.id] = {
          inviteeAccountId: event.transaction.inviteeAccountId,
          signaturePublicKey: event.transaction.signaturePublicKey,
          encryptionPublicKey: event.transaction.encryptionPublicKey,
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
