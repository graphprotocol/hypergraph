import { Effect, Exit } from 'effect';

import type { Messages } from '@graphprotocol/hypergraph';
import { SpaceEvents } from '@graphprotocol/hypergraph';

import { prisma } from '../prisma.js';
import { getIdentity } from './getIdentity.js';

type Params = {
  accountId: string;
  spaceId: string;
  event: SpaceEvents.SpaceEvent;
  keyBoxes: Messages.KeyBoxWithKeyId[];
};

export async function applySpaceEvent({ accountId, spaceId, event, keyBoxes }: Params) {
  if (event.transaction.type === 'create-space') {
    throw new Error('applySpaceEvent does not support create-space events.');
  }

  return await prisma.$transaction(async (transaction) => {
    if (event.transaction.type === 'accept-invitation') {
      // verify that the account is the invitee
      await transaction.invitation.findFirstOrThrow({
        where: { inviteeAccountId: event.author.accountId },
      });
    } else {
      // verify that the account is a member of the space
      // TODO verify that the account is a admin of the space
      await transaction.space.findUniqueOrThrow({
        where: { id: spaceId, members: { some: { id: accountId } } },
      });
    }

    const lastEvent = await transaction.spaceEvent.findFirstOrThrow({
      where: { spaceId },
      orderBy: { counter: 'desc' },
    });

    const identity = await getIdentity({ accountId });

    const result = await Effect.runPromiseExit(
      SpaceEvents.applyEvent({
        event,
        state: JSON.parse(lastEvent.state),
        getVerifiedIdentity: () => Effect.succeed(identity),
      }),
    );
    if (Exit.isFailure(result)) {
      console.log('Failed to apply event', result);
      throw new Error('Invalid event');
    }

    if (event.transaction.type === 'create-invitation') {
      const inviteeAccountId = event.transaction.inviteeAccountId;
      await transaction.invitation.create({
        data: {
          id: event.transaction.id,
          spaceId,
          accountId: event.author.accountId,
          inviteeAccountId,
        },
      });
      await transaction.spaceKeyBox.createMany({
        data: keyBoxes.map((keyBox) => ({
          id: `${keyBox.id}-${inviteeAccountId}`,
          nonce: keyBox.nonce,
          ciphertext: keyBox.ciphertext,
          accountId: inviteeAccountId,
          authorPublicKey: keyBox.authorPublicKey,
          spaceKeyId: keyBox.id,
        })),
      });
    }
    if (event.transaction.type === 'accept-invitation') {
      await transaction.invitation.delete({
        where: { spaceId_inviteeAccountId: { spaceId, inviteeAccountId: event.author.accountId } },
      });

      await transaction.space.update({
        where: { id: spaceId },
        data: { members: { connect: { id: event.author.accountId } } },
      });
    }

    return await transaction.spaceEvent.create({
      data: {
        spaceId,
        counter: lastEvent.counter + 1,
        event: JSON.stringify(event),
        id: event.transaction.id,
        state: JSON.stringify(result.value),
      },
    });
  });
}
