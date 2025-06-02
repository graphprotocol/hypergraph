'use client';

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from '@headlessui/react';
import { CodeBracketIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { DocumentPlusIcon, FolderIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import * as Chunk from 'effect/Chunk';
import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';
import * as Stream from 'effect/Stream';
import { atom, useAtom } from 'jotai';
import { useEffect, useState } from 'react';

import type { SchemaBrowserTypesQuery } from '../generated/graphql.js';
import { fetchApps } from '../hooks/useAppQuery.js';
import { useOSQuery } from '../hooks/useOSQuery.js';
import { fetchSchemaTypes } from '../hooks/useSchemaBrowserQuery.js';
import type { App } from '../schema.js';
import { Loading } from './Loading.js';

class SearchResult extends Schema.Class<SearchResult>('SearchResult')({
  id: Schema.NonEmptyTrimmedString,
  type: Schema.Literal('entity', 'app'),
  name: Schema.NonEmptyTrimmedString,
  slug: Schema.NonEmptyTrimmedString,
}) {}

async function search(): Promise<Readonly<Array<SearchResult>>> {
  const fetchSchemaTypesStream = Stream.fromIterableEffect(
    Effect.tryPromise({
      async try() {
        const schemaTypes = await fetchSchemaTypes();
        return schemaTypes.space?.types ?? [];
      },
      catch(err) {
        console.error('failure fetching type entities from knowledge graph', { err });
        return [] as NonNullable<SchemaBrowserTypesQuery['space']>['types'];
      },
    }),
  ).pipe(
    Stream.map(
      (entity) =>
        ({
          id: entity.id,
          type: 'entity',
          name: entity.name || entity.id,
          slug: `${entity.id}${entity.name || ''}`.toLowerCase(),
        }) as const satisfies SearchResult,
    ),
  );
  const fetchAppsStream = Stream.fromIterableEffect(
    Effect.tryPromise({
      async try() {
        return await fetchApps();
      },
      catch(err) {
        console.error('failure fetching apps from api', { err });
        return [] as Readonly<Array<App>>;
      },
    }),
  ).pipe(
    Stream.map(
      (app) =>
        ({
          id: `${app.id}`,
          type: 'app',
          name: app.name,
          slug: `${app.id}${app.name}${app.description || ''}${app.directory || ''}`,
        }) as const satisfies SearchResult,
    ),
  );

  const program = Stream.merge(fetchSchemaTypesStream, fetchAppsStream);
  const resultsChunk = await Effect.runPromise(Stream.runCollect(program));

  return Chunk.toReadonlyArray(resultsChunk);
}

export const cmdPaletteOpenAtom = atom(false);

export function CmdPalette() {
  const router = useRouter();
  const { data: os } = useOSQuery();
  const [cmdPaletteOpen, setCmdPaletteOpen] = useAtom(cmdPaletteOpenAtom);

  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['Space', 'search'] as const,
    async queryFn() {
      return await search();
    },
    select(data) {
      if (!query) {
        return data;
      }

      const normalizedQuery = query.toLocaleLowerCase();
      return data.filter((result) => result.slug.includes(normalizedQuery));
    },
  });
  const results = data ?? [];

  // listen for the user to type cmd/ctrl+k and set the cmdPaletteOpen atom to true
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (os == null) {
        return;
      }
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      const modifier = os === 'MacOS' ? event.metaKey : event.ctrlKey;

      if (modifier && event.key === 'k') {
        event.preventDefault(); // Prevent default browser behavior
        setCmdPaletteOpen(true);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setCmdPaletteOpen, os]);

  // if the user types cmd/ctrl+N with the command palette open, navigate to the create new apps page
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (os == null || !cmdPaletteOpen) {
        return;
      }
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      const modifier = os === 'MacOS' ? event.metaKey : event.ctrlKey;

      if (modifier && event.key === 'N') {
        event.preventDefault(); // Prevent default browser behavior
        void router.navigate({ to: '/apps/create' });
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, cmdPaletteOpen, os]);

  return (
    <Dialog
      className="relative z-10"
      open={cmdPaletteOpen}
      onClose={() => {
        setCmdPaletteOpen(false);
        setQuery('');
      }}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/25 dark:bg-slate-800/25 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
        <DialogPanel
          transition
          className="mx-auto max-w-2xl transform divide-y divide-gray-200 dark:divide-gray-500/20 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 shadow-2xl transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        >
          <Combobox<SearchResult | 'create_new_app'>
            onChange={(item) => {
              if (item) {
                if (typeof item === 'string' && item === 'create_new_app') {
                  void router.navigate({ to: '/apps/create' });
                } else if (item.type === 'app') {
                  void router.navigate({ to: '/apps/$appId/details', params: { appId: item.id } });
                }
                setCmdPaletteOpen(false);
              }
            }}
          >
            <div className="grid grid-cols-1">
              <ComboboxInput
                autoFocus
                className="col-start-1 row-start-1 h-12 w-full bg-transparent pl-11 pr-4 text-base text-white outline-none placeholder:text-gray-500 sm:text-sm"
                placeholder="Search..."
                onChange={(event) => setQuery(event.target.value)}
                onBlur={() => setQuery('')}
              />
              {isLoading ? (
                <Loading />
              ) : (
                <MagnifyingGlassIcon
                  className="pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center text-gray-500"
                  aria-hidden="true"
                />
              )}
            </div>

            {query === '' || results.length > 0 ? (
              <ComboboxOptions
                static
                as="ul"
                className="max-h-80 scroll-py-2 divide-y divide-gray-500/20 overflow-y-auto"
              >
                <li className="p-2">
                  <ul className="text-sm text-gray-400">
                    {results.map((result) => (
                      <Option key={result.id} result={result} />
                    ))}
                  </ul>
                </li>
                {query === '' && !isLoading ? (
                  <li className="p-2">
                    <h2 className="sr-only">Quick actions</h2>
                    <ul className="text-sm text-gray-400">
                      <ComboboxOption
                        key="Create new app"
                        as={Link}
                        to="/apps/create"
                        value={'create_new_app'}
                        className="group flex cursor-default select-none items-center rounded-md px-3 py-2 data-[focus]:bg-gray-800 data-[focus]:text-white data-[focus]:outline-none"
                      >
                        <DocumentPlusIcon
                          className="size-6 flex-none text-gray-500 group-data-[focus]:text-white forced-colors:group-data-[focus]:text-[Highlight]"
                          aria-hidden="true"
                        />
                        <span className="ml-3 flex-auto truncate">Create new app...</span>
                        <span className="ml-3 flex-none text-xs font-semibold text-gray-400">
                          <kbd className="font-sans">{os === 'MacOS' ? '⌘' : '^'}</kbd>
                          <kbd className="font-sans">N</kbd>
                        </span>
                      </ComboboxOption>
                    </ul>
                  </li>
                ) : null}
              </ComboboxOptions>
            ) : null}

            {query !== '' && results.length === 0 ? (
              <div className="px-6 py-14 text-center sm:px-14">
                <FolderIcon className="mx-auto size-6 text-gray-500" aria-hidden="true" />
                <p className="mt-4 text-sm text-gray-200">
                  We couldn't find any search results with that term. Please try again.
                </p>
              </div>
            ) : null}
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: type inference from the routes for link does not get populated for as={Link}
type UnknownLinkParams = any;

function Option({ result }: Readonly<{ result: SearchResult }>) {
  if (result.type === 'app') {
    return (
      <ComboboxOption
        value={result}
        as={Link}
        to="/apps/$appId/details"
        params={{ appId: result.id } as UnknownLinkParams}
        className="group flex items-center cursor-default select-none rounded-xl p-3 data-[focus]:bg-gray-100 dark:data-[focus]:bg-slate-700 data-[focus]:outline-none"
      >
        <OptionContent result={result} />
      </ComboboxOption>
    );
  }

  return (
    <ComboboxOption
      value={result}
      className="group flex items-center cursor-default select-none rounded-xl p-3 data-[focus]:bg-gray-100 dark:data-[focus]:bg-slate-700 data-[focus]:outline-none"
    >
      <OptionContent result={result} />
    </ComboboxOption>
  );
}

function OptionContent({ result }: Readonly<{ result: SearchResult }>) {
  return (
    <>
      <div
        data-type={result.type}
        className="flex size-10 flex-none items-center justify-center rounded-lg data-[type=app]:bg-indigo-700 data-[type=entity]:bg-teal-700"
      >
        {result.type === 'app' ? (
          <FolderIcon className="size-5 text-white" aria-hidden="true" />
        ) : (
          <CodeBracketIcon className="size-5 text-white" aria-hidden="true" />
        )}
      </div>
      <div className="ml-4 flex-auto">
        <p className="text-sm font-medium flex w-full items-center justify-between gap-x-3 text-gray-700 dark:text-white group-data-[focus]:text-gray-900 dark:group-data-[focus]:text-gray-200">
          <span>{result.name}</span>
          <span
            data-type={result.type}
            className="inline-flex items-center rounded-md data-[type=app]:bg-indigo-400/10 data-[type=entity]:bg-teal-400/10 px-2 py-1 text-xs font-medium data-[type=app]:text-indigo-400 data-[type=entity]:text-teal-400 ring-1 ring-inset data-[type=app]:ring-indigo-400/20 data-[type=entity]:ring-teal-400/20 capitalize"
          >
            {result.type}
          </span>
        </p>
      </div>
    </>
  );
}
