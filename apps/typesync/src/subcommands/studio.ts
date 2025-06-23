import { createServer } from 'node:http';
import * as Command from '@effect/cli/Command';
import * as Options from '@effect/cli/Options';
import * as NodeHttpServer from '@effect/platform-node/NodeHttpServer';
import * as HttpServer from '@effect/platform/HttpServer';
import * as Console from 'effect/Console';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import open, { type AppName, apps } from 'open';

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
    browser: Options.choice('browser', [
      'chrome',
      'firefox',
      'edge',
      'safari',
      'arc',
      'browser',
      'browserPrivate',
    ]).pipe(
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

const openBrowser = (port: number, browser: AppName | 'arc' | 'safari' | 'browser' | 'browserPrivate') =>
  Effect.async<void, OpenBrowserError>((resume) => {
    const url = `http://localhost:${port}`;

    const launch = (appOpts?: { name: string | readonly string[] }) =>
      open(url, appOpts ? { app: appOpts } : undefined).then((subprocess) => {
        subprocess.on('spawn', () => resume(Effect.void));
        subprocess.on('error', (err) => resume(Effect.fail(new OpenBrowserError({ cause: err }))));
      });

    const mapBrowserName = (b: typeof browser): string | readonly string[] | undefined => {
      switch (b) {
        case 'chrome':
          return apps.chrome; // cross-platform alias from open
        case 'firefox':
          return apps.firefox;
        case 'edge':
          return apps.edge;
        case 'safari':
          return 'Safari';
        case 'arc':
          return 'Arc';
        default:
          return undefined;
      }
    };

    switch (browser) {
      case 'browser':
        launch();
        break;
      case 'browserPrivate':
        launch({ name: apps.browserPrivate });
        break;
      default: {
        const mapped = mapBrowserName(browser);
        mapped ? launch({ name: mapped }).catch(() => launch()) : launch();
        break;
      }
    }
  });

export class OpenBrowserError extends Data.TaggedError('/typesync/errors/OpenBrowserError')<{
  readonly cause: unknown;
}> {}
