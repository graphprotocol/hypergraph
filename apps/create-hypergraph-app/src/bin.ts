#!/usr/bin/env node

import { NodeContext, NodeFileSystem, NodeRuntime } from '@effect/platform-node';
import * as Effect from 'effect/Effect';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';

import { run } from './Cli.js';
import { AnsiDocLogger } from './Logger.js';

const runnable = Effect.suspend(() => run(process.argv)).pipe(
  // replaces default logger with AnsiDocLogger
  Effect.provide(Logger.replace(Logger.defaultLogger, AnsiDocLogger)),
  Logger.withMinimumLogLevel(LogLevel.Info),
  Effect.provide(NodeFileSystem.layer),
  Effect.provide(NodeContext.layer),
);
runnable.pipe(
  Effect.orDie,
  NodeRuntime.runMain({ disableErrorReporting: process.env.NODE_ENV === 'prod', disablePrettyLogger: true }),
);
