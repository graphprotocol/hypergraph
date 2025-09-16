import { Messages } from '@graphprotocol/hypergraph';
import { Context, Effect, Layer, Ref } from 'effect';
import type * as Mailbox from 'effect/Mailbox';

type Connection = {
  accountAddress: string;
  appIdentityAddress: string | undefined;
  mailbox: Mailbox.Mailbox<Messages.ResponseMessage>;
  subscribedSpaces: Set<string>;
};

export class ConnectionsService extends Context.Tag('ConnectionsService')<
  ConnectionsService,
  {
    readonly registerConnection: (params: {
      accountAddress: string;
      appIdentityAddress: string | undefined;
      mailbox: Mailbox.Mailbox<Messages.ResponseMessage>;
    }) => Effect.Effect<string>;
    readonly removeConnection: (connectionId: string) => Effect.Effect<void>;
    readonly subscribeToSpace: (connectionId: string, spaceId: string) => Effect.Effect<void>;
    readonly unsubscribeFromSpace: (connectionId: string, spaceId: string) => Effect.Effect<void>;
    readonly broadcastToSpace: (params: {
      spaceId: string;
      message: Messages.ResponseMessage;
      excludeConnectionId?: string;
    }) => Effect.Effect<void>;
    readonly broadcastToAccount: (params: {
      accountAddress: string;
      message: Messages.ResponseMessage;
      excludeConnectionId?: string;
    }) => Effect.Effect<void>;
    readonly getConnection: (connectionId: string) => Effect.Effect<Connection | undefined>;
  }
>() {}

export const layer = Effect.gen(function* () {
  // Store connections by a unique connection ID
  const connections = yield* Ref.make(new Map<string, Connection>());
  const connectionCounter = yield* Ref.make(0);

  const registerConnection = Effect.fn('registerConnection')(function* ({
    accountAddress,
    appIdentityAddress,
    mailbox,
  }: {
    accountAddress: string;
    appIdentityAddress: string | undefined;
    mailbox: Mailbox.Mailbox<Messages.ResponseMessage>;
  }) {
    const nextId = yield* Ref.updateAndGet(connectionCounter, (n) => n + 1);
    yield* Effect.logInfo('Next ID', {
      nextId,
    });
    const connectionId = `conn-${nextId}`;
    const connection: Connection = {
      accountAddress,
      appIdentityAddress,
      mailbox,
      subscribedSpaces: new Set(),
    };

    yield* Ref.update(connections, (map) => new Map(map).set(connectionId, connection));

    yield* Effect.logInfo('Registered new connection', {
      connectionId,
      accountAddress,
      appIdentityAddress,
    });

    return connectionId;
  });

  const removeConnection = Effect.fn('removeConnection')(function* (connectionId: string) {
    const currentConnections = yield* Ref.get(connections);
    const connection = currentConnections.get(connectionId);

    if (connection) {
      yield* Effect.logInfo('Removing connection', {
        connectionId,
        accountAddress: connection.accountAddress,
        subscribedSpaces: Array.from(connection.subscribedSpaces),
      });

      yield* Ref.update(connections, (map) => {
        const newMap = new Map(map);
        newMap.delete(connectionId);
        return newMap;
      });
    }
  });

  const subscribeToSpace = Effect.fn('subscribeToSpace')(function* (connectionId: string, spaceId: string) {
    const currentConnections = yield* Ref.get(connections);
    const connection = currentConnections.get(connectionId);

    if (connection) {
      yield* Ref.update(connections, (map) => {
        const newMap = new Map(map);
        const conn = newMap.get(connectionId);
        if (conn) {
          conn.subscribedSpaces.add(spaceId);
        }
        return newMap;
      });

      yield* Effect.logInfo('Subscribed connection to space', {
        connectionId,
        spaceId,
        accountAddress: connection.accountAddress,
      });
    }
  });

  const unsubscribeFromSpace = Effect.fn('unsubscribeFromSpace')(function* (connectionId: string, spaceId: string) {
    const currentConnections = yield* Ref.get(connections);
    const connection = currentConnections.get(connectionId);

    if (connection) {
      yield* Ref.update(connections, (map) => {
        const newMap = new Map(map);
        const conn = newMap.get(connectionId);
        if (conn) {
          conn.subscribedSpaces.delete(spaceId);
        }
        return newMap;
      });

      yield* Effect.logInfo('Unsubscribed connection from space', {
        connectionId,
        spaceId,
        accountAddress: connection.accountAddress,
      });
    }
  });

  const broadcastToSpace = Effect.fn('broadcastToSpace')(function* ({
    spaceId,
    message,
    excludeConnectionId,
  }: {
    spaceId: string;
    message: Messages.ResponseMessage;
    excludeConnectionId?: string;
  }) {
    const currentConnections = yield* Ref.get(connections);

    for (const [connectionId, connection] of currentConnections) {
      // Skip if this is the excluded connection (sender)
      if (excludeConnectionId && connectionId === excludeConnectionId) {
        continue;
      }

      // Only send to connections subscribed to this space
      if (connection.subscribedSpaces.has(spaceId)) {
        yield* connection.mailbox.offer(Messages.serializeV2(message));
      }
    }
  });

  const broadcastToAccount = Effect.fn('broadcastToAccount')(function* ({
    accountAddress,
    message,
    excludeConnectionId,
  }: {
    accountAddress: string;
    message: Messages.ResponseMessage;
    excludeConnectionId?: string;
  }) {
    const currentConnections = yield* Ref.get(connections);

    for (const [connectionId, connection] of currentConnections) {
      // Skip if this is the excluded connection (sender)
      if (excludeConnectionId && connectionId === excludeConnectionId) {
        continue;
      }

      // Only send to connections from the same account
      if (connection.accountAddress === accountAddress) {
        yield* connection.mailbox.offer(Messages.serializeV2(message));
      }
    }
  });

  const getConnection = Effect.fn('getConnection')(function* (connectionId: string) {
    const currentConnections = yield* Ref.get(connections);
    return currentConnections.get(connectionId);
  });

  return {
    registerConnection,
    removeConnection,
    subscribeToSpace,
    unsubscribeFromSpace,
    broadcastToSpace,
    broadcastToAccount,
    getConnection,
  } as const;
}).pipe(Layer.effect(ConnectionsService));
