import * as Schema from 'effect/Schema';
import { SpaceEvent } from 'graph-framework-space-events';

export const EventMessage = Schema.Struct({
  type: Schema.Literal('event'),
  spaceId: Schema.String,
  event: SpaceEvent,
});

export type EventMessage = Schema.Schema.Type<typeof EventMessage>;

export const RequestSubscribeToSpace = Schema.Struct({
  type: Schema.Literal('subscribe-space'),
  id: Schema.String,
});

export type RequestSubscribeToSpace = Schema.Schema.Type<typeof RequestSubscribeToSpace>;

export const RequestListSpaces = Schema.Struct({
  type: Schema.Literal('list-spaces'),
});

export type RequestListSpaces = Schema.Schema.Type<typeof RequestListSpaces>;

export const RequestMessage = Schema.Union(EventMessage, RequestSubscribeToSpace, RequestListSpaces);

export type RequestMessage = Schema.Schema.Type<typeof RequestMessage>;

export const ResponseListSpaces = Schema.Struct({
  type: Schema.Literal('list-spaces'),
  spaces: Schema.Array(
    Schema.Struct({
      id: Schema.String,
    }),
  ),
});

export type ResponseListSpaces = Schema.Schema.Type<typeof ResponseListSpaces>;

export const ResponseSpace = Schema.Struct({
  type: Schema.Literal('space'),
  id: Schema.String,
  events: Schema.Array(SpaceEvent),
});

export type ResponseSpace = Schema.Schema.Type<typeof ResponseSpace>;

export const ResponseMessage = Schema.Union(EventMessage, ResponseListSpaces, ResponseSpace);

export type ResponseMessage = Schema.Schema.Type<typeof ResponseMessage>;
