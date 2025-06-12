import type { ChildProcess } from 'node:child_process';
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
const openApp = Options.boolean('open').pipe(
  Options.withAlias('o'),
  Options.withDefault(true),
  Options.withDescription('If true, the TypeSync app will open in your default browser. Default true'),
);

const command = Command.make('typesync', { port, openApp }, ({ port, openApp }) =>
  Effect.gen(function* () {
    const openBrowser = Effect.async<ChildProcess | undefined, Error>((resume) => {
      if (!openApp) {
        resume(Effect.succeed(undefined));
      }
      open(`http://localhost:${port}`, { app: { name: apps.firefox } }).then((subprocess) => {
        // wait for child process to start befor succeeding
        subprocess.on('spawn', () => {
          resume(Effect.succeed(subprocess));
        });
        subprocess.on('error', (err) => {
          resume(Effect.fail(new OpenBrowserError({ cause: err })));
        });
      });
    });

    // start serving api
    yield* Server.Server.pipe(
      HttpServer.withLogAddress,
      Layer.provide(
        NodeHttpServer.layer(createServer, { port }).pipe(
          // Layer.tap(() =>
          //   openBrowser.pipe(
          //     Effect.tapBoth({
          //       onFailure(e) {
          //         return Effect.logError('failure initializing and opening browser', e);
          //       },
          //       onSuccess(a) {
          //         if (a) {
          //           return Effect.logInfo(`TypeSync app opened in browser at http://localhost:${port}`);
          //         }
          //         return Effect.void;
          //       },
          //     }),
          //   ),
          // ),
        ),
      ),
      Layer.launch,
    );
  }),
);

export const run = Command.run(command, {
  name: '@graphprotocol/typesync',
  version: '0.0.0-alpha',
});
