import * as Schema from 'effect/Schema';

export const InboxSenderAuthPolicy = Schema.Union(
  Schema.Literal('anonymous'),
  Schema.Literal('optional_auth'),
  Schema.Literal('requires_auth'),
);

export type InboxSenderAuthPolicy = Schema.Schema.Type<typeof InboxSenderAuthPolicy>;
