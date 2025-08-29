import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { Effect, Schema } from 'effect';
import type { InvalidIdentityError, PublicIdentity } from '../identity/types.js';
import { canonicalize, stringToUint8Array } from '../utils/index.js';
import { hashEvent } from './hash-event.js';
import {
  type ApplyError,
  InvalidEventError,
  SpaceEvent,
  type SpaceInbox,
  type SpaceInvitation,
  type SpaceMember,
  type SpaceState,
  VerifySignatureError,
} from './types.js';

type Params = {
  state: SpaceState | undefined;
  event: SpaceEvent;
  getVerifiedIdentity: (
    accountAddress: string,
    publicKey: string,
  ) => Effect.Effect<PublicIdentity, InvalidIdentityError>;
};

const decodeSpaceEvent = Schema.decodeUnknownEither(SpaceEvent);

export const applyEvent = ({
  state,
  event: rawEvent,
  getVerifiedIdentity,
}: Params): Effect.Effect<SpaceState, ApplyError> => {
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
  const authorPublicKey = `0x${signatureInstance.recoverPublicKey(sha256(encodedTransaction)).toHex()}`;

  return Effect.gen(function* () {
    const identity = yield* getVerifiedIdentity(event.author.accountAddress, authorPublicKey);
    if (authorPublicKey !== identity.signaturePublicKey) {
      return yield* new VerifySignatureError();
    }

    let id = '';
    let members: { [accountAddress: string]: SpaceMember } = {};
    let removedMembers: { [accountAddress: string]: SpaceMember } = {};
    let invitations: { [id: string]: SpaceInvitation } = {};
    let inboxes: { [inboxId: string]: SpaceInbox } = {};
    if (event.transaction.type === 'create-space') {
      id = event.transaction.id;
      members[event.transaction.creatorAccountAddress] = {
        accountAddress: event.transaction.creatorAccountAddress,
        role: 'admin',
      };
    } else if (state !== undefined) {
      id = state.id;
      members = { ...state.members };
      removedMembers = { ...state.removedMembers };
      invitations = { ...state.invitations };
      inboxes = { ...state.inboxes };
      if (event.transaction.type === 'accept-invitation') {
        // is already a member
        if (members[event.author.accountAddress] !== undefined) {
          return yield* new InvalidEventError();
        }

        // find the invitation
        const result = Object.entries(invitations).find(
          ([, invitation]) => invitation.inviteeAccountAddress === event.author.accountAddress,
        );
        if (!result) {
          return yield* new InvalidEventError();
        }

        const [id, invitation] = result;

        members[invitation.inviteeAccountAddress] = {
          accountAddress: invitation.inviteeAccountAddress,
          role: 'member',
        };
        delete invitations[id];
        if (removedMembers[event.author.accountAddress] !== undefined) {
          delete removedMembers[event.author.accountAddress];
        }
      } else {
        // check if the author is an admin
        if (members[event.author.accountAddress]?.role !== 'admin') {
          return yield* new InvalidEventError();
        }

        if (event.transaction.type === 'delete-space') {
          removedMembers = { ...members };
          members = {};
          invitations = {};
        } else if (event.transaction.type === 'create-invitation') {
          if (members[event.transaction.inviteeAccountAddress] !== undefined) {
            return yield* new InvalidEventError();
          }
          for (const invitation of Object.values(invitations)) {
            if (invitation.inviteeAccountAddress === event.transaction.inviteeAccountAddress) {
              return yield* new InvalidEventError();
            }
          }

          invitations[event.transaction.id] = {
            inviteeAccountAddress: event.transaction.inviteeAccountAddress,
          };
        } else if (event.transaction.type === 'create-space-inbox') {
          if (inboxes[event.transaction.inboxId] !== undefined) {
            return yield* new InvalidEventError();
          }
          inboxes[event.transaction.inboxId] = {
            inboxId: event.transaction.inboxId,
            encryptionPublicKey: event.transaction.encryptionPublicKey,
            isPublic: event.transaction.isPublic,
            authPolicy: event.transaction.authPolicy,
            secretKey: event.transaction.secretKey,
          };
        } else {
          // state is required for all events except create-space
          return yield* new InvalidEventError();
        }
      }
    }

    return {
      id,
      members,
      removedMembers,
      invitations,
      inboxes,
      lastEventHash: hashEvent(event),
    };
  });
};
