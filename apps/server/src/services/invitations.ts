import { type Messages, SpaceEvents } from '@graphprotocol/hypergraph';
import { Context, Effect, Layer } from 'effect';
import * as Schema from 'effect/Schema';
import * as DatabaseService from './database.js';
import * as IdentityService from './identity.js';

export class InvitationsService extends Context.Tag('InvitationsService')<
  InvitationsService,
  {
    readonly listByAppIdentity: (
      appIdentityAddress: string,
    ) => Effect.Effect<Messages.Invitation[], DatabaseService.DatabaseError>;
  }
>() {}

const decodeSpaceState = Schema.decodeUnknownEither(SpaceEvents.SpaceState);

export const layer = Effect.gen(function* () {
  const { use } = yield* DatabaseService.DatabaseService;

  const listByAppIdentity = Effect.fn('listByAppIdentity')(function* (accountAddress: string) {
    const invitations = yield* use((client) =>
      client.invitation.findMany({
        where: {
          inviteeAccountAddress: accountAddress,
        },
        include: {
          space: {
            include: {
              events: {
                orderBy: {
                  counter: 'desc',
                },
                take: 1,
              },
            },
          },
        },
      }),
    );

    const processedInvitations = [];
    for (const invitation of invitations) {
      const result = decodeSpaceState(JSON.parse(invitation.space.events[0].state));
      if (result._tag === 'Right') {
        const state = result.right;
        processedInvitations.push({
          id: invitation.id,
          previousEventHash: state.lastEventHash,
          spaceId: invitation.spaceId,
        });
      } else {
        yield* Effect.logError('Invalid space state from the DB', { error: result.left });
      }
    }
    return processedInvitations;
  });

  return {
    listByAppIdentity,
  } as const;
}).pipe(Layer.effect(InvitationsService), Layer.provide(DatabaseService.layer), Layer.provide(IdentityService.layer));
