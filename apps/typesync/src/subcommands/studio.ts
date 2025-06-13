import { createServer } from 'node:http';
import * as Command from '@effect/cli/Command';
import * as Options from '@effect/cli/Options';
import * as NodeHttpServer from '@effect/platform-node/NodeHttpServer';
import * as HttpServer from '@effect/platform/HttpServer';
import * as Console from 'effect/Console';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import open, { type AppName } from 'open';

import * as Server from '../Server.js';

export const studio = Command.make('studio', {
  args: {
    port: Options.integer('port').pipe(
      Options.withAlias('p'),
      Options.withDefault(3000),
      Options.withDescription('The port to run the Typesync studio server on. Default 3000'),
    ),
    open: Options.boolean('open').pipe(
      Options.withDescription('If true, opens the Typesync studio in your browser'),
      Options.withDefault(true),
    ),
    browser: Options.choice('browser', ['chrome', 'firefox', 'edge', 'browser', 'browserPrivate']).pipe(
      Options.withAlias('b'),
      Options.withDescription('Broweser to open the Typesync studio app in. Default is your default selected browser'),
      Options.withDefault('browser'),
    ),
  },
}).pipe(
  Command.withDescription('Opens the Typesync studio for interacting with application schemas'),
  Command.withHandler(({ args }) =>
    Effect.gen(function* () {
      yield* Server.Server.pipe(
        HttpServer.withLogAddress,
        Layer.provide(NodeHttpServer.layer(createServer, { port: args.port })),
        Layer.tap(() =>
          Effect.gen(function* () {
            if (args.open) {
              return yield* openBrowser(args.port, args.browser).pipe(
                Effect.tapErrorCause((cause) =>
                  Console.warn(
                    `Failure opening Typesync studio in your browser. Open at http://localhost:${args.port}`,
                    {
                      cause,
                    },
                  ),
                ),
                Effect.orElseSucceed(() => Effect.void),
              );
            }
            return Effect.void;
          }),
        ),
        Layer.tap(() => Console.log(`🎉 Typesync studio started and running at http://localhost:${args.port}`)),
        Layer.launch,
      );
    }),
  ),
);

const openBrowser = (port: number, browser: AppName) =>
  Effect.async<void, OpenBrowserError>((resume) => {
    open(`http://localhost:${port}`, {
      app: { name: browser },
    }).then((subprocess) => {
      // wait for child process to start before succeeding
      subprocess.on('spawn', () => {
        resume(Effect.void);
      });
      subprocess.on('error', (err) => {
        resume(Effect.fail(new OpenBrowserError({ cause: err })));
      });
    });
  });

export class OpenBrowserError extends Data.TaggedError('/typesync/errors/OpenBrowserError')<{
  readonly cause: unknown;
}> {}
