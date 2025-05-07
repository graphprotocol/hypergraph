#!/usr/bin/env node

import * as NodeContext from '@effect/platform-node/NodeContext';
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import * as NodeRuntime from '@effect/platform-node/NodeRuntime';
import * as Effect from 'effect/Effect';

import { run } from './Cli.js';
import { DatabaseServiceLive } from './Database.js';
import { SchemaGeneratorLayer } from './Generator.js';

run(process.argv).pipe(
  Effect.provide(DatabaseServiceLive),
  Effect.provide(SchemaGeneratorLayer),
  Effect.provide(NodeFileSystem.layer),
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain({
    disableErrorReporting: process.env.NODE_ENV === 'prod',
  }),
);
