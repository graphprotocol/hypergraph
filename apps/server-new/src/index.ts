import * as Otlp from '@effect/opentelemetry/Otlp';
import { FetchHttpClient, PlatformConfigProvider } from '@effect/platform';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import { Effect, Layer, Logger, Option, Redacted } from 'effect';
import * as Config from './config/honeycomb.ts';
import { server } from './server.ts';

const Observability = Layer.unwrapEffect(
  Effect.gen(function* () {
    const apiKey = yield* Config.honeycombApiKeyConfig;
    if (Option.isNone(apiKey)) {
      return Layer.empty;
    }

    return Otlp.layer({
      baseUrl: 'https://api.honeycomb.io',
      headers: {
        'x-honeycomb-team': Redacted.value(apiKey.value),
      },
      resource: {
        serviceName: 'hypergraph-server',
      },
    }).pipe(Layer.provide(FetchHttpClient.layer));
  }),
);

const layer = server.pipe(
  Layer.provide(Logger.structured),
  // Layer.provide(Logger.pretty),
  Layer.provide(Observability),
  Layer.provide(PlatformConfigProvider.layerDotEnvAdd('.env')),
  Layer.provide(NodeContext.layer),
);

NodeRuntime.runMain(Layer.launch(layer), {
  disablePrettyLogger: true,
});
