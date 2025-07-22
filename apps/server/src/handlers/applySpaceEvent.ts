import type { Messages } from '@graphprotocol/hypergraph';
import { Identity, SpaceEvents } from '@graphprotocol/hypergraph';
import { Effect, Exit } from 'effect';

import { prisma } from '../prisma.js';
import { getAppOrConnectIdentity } from './getAppOrConnectIdentity.js';

type Params = {
  accountAddress: string;
  spaceId: string;
  event: SpaceEvents.SpaceEvent;
  keyBoxes: Messages.KeyBoxWithKeyId[];
};

export async function applySpaceEvent({ accountAddress, spaceId, event, keyBoxes }: Params) {
  if (event.transaction.type === 'create-space') {
    throw new Error('applySpaceEvent does not support create-space events.');
  }

  await prisma.$transaction(async (transaction) => {
    if (event.transaction.type === 'accept-invitation') {
      // verify that the account is the invitee
      await transaction.invitation.findFirstOrThrow({
        where: { inviteeAccountAddress: event.author.accountAddress },
      });
    } else {
      // verify that the account is a member of the space
      // TODO verify that the account is a admin of the space
      await transaction.space.findUniqueOrThrow({
        where: {
          id: spaceId,
          members: { some: { address: accountAddress } },
        },
      });
    }

    const lastEvent = await transaction.spaceEvent.findFirstOrThrow({
      where: { spaceId },
      orderBy: { counter: 'desc' },
    });

    const getVerifiedIdentity = (accountAddressToFetch: string, publicKey: string) => {
      console.log('getVerifiedIdentity', accountAddressToFetch, accountAddress);
      // applySpaceEvent is only allowed to be called by the account that is applying the event
      if (accountAddressToFetch !== accountAddress) {
        return Effect.fail(new Identity.InvalidIdentityError());
      }

      return Effect.gen(function* () {
        const identity = yield* Effect.tryPromise({
          try: () =>
            getAppOrConnectIdentity({ accountAddress: accountAddressToFetch, signaturePublicKey: publicKey, spaceId }),
          catch: () => new Identity.InvalidIdentityError(),
        });
        return identity;
      });
    };

    const result = await Effect.runPromiseExit(
      SpaceEvents.applyEvent({
        event,
        state: JSON.parse(lastEvent.state),
        getVerifiedIdentity,
      }),
    );
    if (Exit.isFailure(result)) {
      console.log('Failed to apply event', result);
      throw new Error('Invalid event');
    }

    if (event.transaction.type === 'create-invitation') {
      const inviteeAccountAddress = event.transaction.inviteeAccountAddress;
      await transaction.invitation.create({
        data: {
          id: event.transaction.id,
          spaceId,
          accountAddress: event.author.accountAddress,
          inviteeAccountAddress,
        },
      });
      await transaction.spaceKeyBox.createMany({
        data: keyBoxes.map((keyBox) => ({
          id: `${keyBox.id}-${inviteeAccountAddress}`,
          nonce: keyBox.nonce,
          ciphertext: keyBox.ciphertext,
          accountAddress: inviteeAccountAddress,
          authorPublicKey: keyBox.authorPublicKey,
          spaceKeyId: keyBox.id,
        })),
      });
    }
    if (event.transaction.type === 'accept-invitation') {
      await transaction.invitation.delete({
        where: { spaceId_inviteeAccountAddress: { spaceId, inviteeAccountAddress: event.author.accountAddress } },
      });

      await transaction.space.update({
        where: { id: spaceId },
        data: { members: { connect: { address: event.author.accountAddress } } },
      });
    }

    await transaction.spaceEvent.create({
      data: {
        spaceId,
        counter: lastEvent.counter + 1,
        event: JSON.stringify(event),
        id: event.transaction.id,
        state: JSON.stringify(result.value),
      },
    });

    if (event.transaction.type === 'create-space-inbox') {
      await transaction.spaceInbox.create({
        data: {
          id: event.transaction.inboxId,
          isPublic: event.transaction.isPublic,
          authPolicy: event.transaction.authPolicy,
          encryptionPublicKey: event.transaction.encryptionPublicKey,
          encryptedSecretKey: event.transaction.secretKey,
          space: { connect: { id: spaceId } },
          spaceEvent: { connect: { id: event.transaction.id } },
        },
      });
    }
  });
}
