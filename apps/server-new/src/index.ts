import { NodeRuntime } from '@effect/platform-node';
import { Layer } from 'effect';
import { server } from './server.ts';

NodeRuntime.runMain(Layer.launch(server));
