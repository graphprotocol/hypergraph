import { createServer } from 'node:http';
import * as Command from '@effect/cli/Command';
import * as Options from '@effect/cli/Options';
import * as NodeHttpServer from '@effect/platform-node/NodeHttpServer';
import * as HttpServer from '@effect/platform/HttpServer';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import open, { apps } from 'open';

import * as Server from './Server.js';

class OpenBrowserError extends Data.TaggedError('OpenBrowserError')<{
  readonly cause: unknown;
}> {}

const port = Options.integer('port').pipe(
  Options.withAlias('p'),
  Options.withDefault(3000),
  Options.withDescription('The port to run the server on. Default 3000'),
);
const openApp = Options.boolean('open-app').pipe(
  Options.withAlias('o'),
  Options.withDefault(true),
  Options.withDescription('If true, the TypeSync app will open in your default browser. Default true'),
);

const command = Command.make('typesync', { port, openApp }, ({ port, openApp }) =>
  Effect.gen(function* () {
    const openTypeSyncApp = Effect.tryPromise({
      async try() {
        /** @todo replace with better package that handles other browsers (this does not support brave or safari) */
        return await open(`http://localhost:${port}`, { app: { name: apps.firefox } });
      },
      catch(err) {
        console.error('failure opening users browser', { err });
        return new OpenBrowserError({ cause: err });
      },
    });

    // start serving api
    yield* Server.Server.pipe(
      HttpServer.withLogAddress,
      Layer.provide(NodeHttpServer.layer(createServer, { port })),
      Layer.launch,
    );
  }),
);

export const run = Command.run(command, {
  name: '@graphprotocol/typesync',
  version: '0.0.0-alpha',
});
