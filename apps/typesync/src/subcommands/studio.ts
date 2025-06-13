import { createServer } from 'node:http';
import * as Command from '@effect/cli/Command';
import * as Options from '@effect/cli/Options';
import * as NodeHttpServer from '@effect/platform-node/NodeHttpServer';
import * as HttpServer from '@effect/platform/HttpServer';
import * as Console from 'effect/Console';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';

import * as Server from '../Server.js';

export const studio = Command.make('studio', {
  args: {
    port: Options.integer('port').pipe(
      Options.withAlias('p'),
      Options.withDefault(3000),
      Options.withDescription('The port to run the server on. Default 3000'),
    ),
  },
}).pipe(
  Command.withDescription('Opens the Typesync studio for interacting with application schemas'),
  Command.withHandler(({ args }) =>
    Effect.gen(function* () {
      yield* Server.Server.pipe(
        HttpServer.withLogAddress,
        Layer.provide(NodeHttpServer.layer(createServer, { port: args.port })),
        Layer.tap(() => Console.log(`🎉 Typesync studio started and running at http://localhost:${args.port}`)),
        Layer.launch,
      );
    }),
  ),
);
