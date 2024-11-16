import { Effect, Exit } from 'effect';
import type { SpaceEvent } from 'graph-framework-space-events';
import { applyEvent } from 'graph-framework-space-events';
import { prisma } from '../prisma.js';

type Params = {
  accountId: string;
  spaceId: string;
  event: SpaceEvent;
};

export async function applySpaceEvent({ accountId, spaceId, event }: Params) {
  if (event.transaction.type === 'create-space') {
    throw new Error('applySpaceEvent does not support create-space events.');
  }

  return await prisma.$transaction(async (transaction) => {
    if (event.transaction.type === 'accept-invitation') {
      // verify that the account is the invitee
      await transaction.invitation.findFirstOrThrow({
        where: { inviteeAccountId: event.author.publicKey },
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

    const result = await Effect.runPromiseExit(applyEvent({ event, state: JSON.parse(lastEvent.state) }));
    if (Exit.isFailure(result)) {
      console.log('Failed to apply event', result);
      throw new Error('Invalid event');
    }

    if (event.transaction.type === 'create-invitation') {
      await transaction.invitation.create({
        data: {
          id: event.transaction.id,
          spaceId,
          accountId: event.transaction.signaturePublicKey,
          inviteeAccountId: event.transaction.signaturePublicKey,
        },
      });
    }
    if (event.transaction.type === 'accept-invitation') {
      await transaction.invitation.delete({
        where: { spaceId_inviteeAccountId: { spaceId, inviteeAccountId: event.author.publicKey } },
      });

      await transaction.space.update({
        where: { id: spaceId },
        data: { members: { connect: { id: event.author.publicKey } } },
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
