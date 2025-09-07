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

    return invitations
      .map((invitation) => {
        const result = decodeSpaceState(JSON.parse(invitation.space.events[0].state));
        if (result._tag === 'Right') {
          const state = result.right;
          return {
            id: invitation.id,
            previousEventHash: state.lastEventHash,
            spaceId: invitation.spaceId,
          };
        }
        console.error('Invalid space state from the DB', result.left);
        return null;
      })
      .filter((invitation) => invitation !== null);
  });

  return {
    listByAppIdentity,
  } as const;
}).pipe(Layer.effect(InvitationsService), Layer.provide(DatabaseService.layer), Layer.provide(IdentityService.layer));
