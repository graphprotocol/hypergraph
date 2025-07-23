#!/usr/bin/env node

import { NodeContext, NodeFileSystem, NodeRuntime } from '@effect/platform-node';
import * as Ansi from '@effect/printer-ansi/Ansi';
import * as AnsiDoc from '@effect/printer-ansi/AnsiDoc';
import * as Effect from 'effect/Effect';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';

import { run } from './Cli.js';
import { AnsiDocLogger } from './Logger.js';

const runnable = Effect.suspend(() => run(process.argv)).pipe(
  Effect.provide(NodeFileSystem.layer),
  Effect.provide(NodeContext.layer),
);

runnable.pipe(
  Effect.catchAllDefect((defect) =>
    Effect.gen(function* () {
      if (defect && typeof defect === 'object' && 'name' in defect && defect.name === 'QuitException') {
        return yield* Effect.logError(
          AnsiDoc.cat(AnsiDoc.hardLine, AnsiDoc.text('Exiting...').pipe(AnsiDoc.annotate(Ansi.red))),
        );
      }
      return Effect.die(defect);
    }),
  ),
  // replaces default logger with AnsiDocLogger
  Effect.provide(Logger.replace(Logger.defaultLogger, AnsiDocLogger)),
  Logger.withMinimumLogLevel(LogLevel.Info),
  Effect.orDie,
  NodeRuntime.runMain({ disableErrorReporting: process.env.NODE_ENV === 'prod', disablePrettyLogger: true }),
);
