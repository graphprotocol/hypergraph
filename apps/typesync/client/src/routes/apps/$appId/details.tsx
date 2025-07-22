'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import {
  ArrowUpIcon,
  CodeBracketIcon,
  CodeBracketSquareIcon,
  PencilSquareIcon,
  PlusIcon,
} from '@heroicons/react/24/solid';
import { useSuspenseQueries } from '@tanstack/react-query';
import { createFileRoute, Link, type NotFoundRouteProps } from '@tanstack/react-router';
import { format } from 'date-fns/format';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import * as Schema from 'effect/Schema';
import { useEffect, useState } from 'react';

import { SchemaPreview } from '../../../Components/App/Schema/SchemaPreview.js';
import { AppStatusBadge } from '../../../Components/App/StatusBadge.js';
import { Loading } from '../../../Components/Loading.js';
import { appEventsQueryOptions, appQueryOptions } from '../../../hooks/useAppQuery.js';
import type { AppEvent } from '../../../schema.js';

const AppDetailsSearchParams = Schema.Struct({
  tab: Schema.NullOr(Schema.Literal('details', 'feed', 'schema')).pipe(Schema.optional),
});
type AppDetailsSearchParams = Schema.Schema.Type<typeof AppDetailsSearchParams>;
const appDetailsSearchParamsDecoder = Schema.decodeUnknownSync(AppDetailsSearchParams);

// biome-ignore lint/suspicious/noExplicitAny: using the react-router Link for the as does not pass the type inference
type UnknownLinkOptions = any;

export const Route = createFileRoute('/apps/$appId/details')({
  component: AppDetailsPage,
  validateSearch(search: Record<string, unknown>): AppDetailsSearchParams {
    const decoded = appDetailsSearchParamsDecoder(search);

    return {
      tab: decoded.tab || 'details',
    } as const;
  },
  async loader({ context, params }) {
    await context.queryClient.ensureQueryData(appQueryOptions(params.appId));
    await context.queryClient.ensureQueryData(appEventsQueryOptions(params.appId));
  },
});

function AppDetailsPage() {
  const params = Route.useParams();
  const search = Route.useSearch();
  const { app, loading } = useSuspenseQueries({
    queries: [appQueryOptions(params.appId), appEventsQueryOptions(params.appId)] as const,
    combine(result) {
      const app =
        result[0].data == null
          ? null
          : ({
              ...result[0].data,
              events: result[1].data,
            } as const);
      return {
        pending: result.some((_data) => _data.isPending),
        loading: result.some((_data) => _data.isLoading),
        isError: result.some((_data) => _data.isError),
        error: result[0].error ?? result[1].error,
        app,
      } as const;
    },
  });

  const [selectedTabIndex, setSelectedTabIndex] = useState(search.tab === 'feed' ? 2 : search.tab === 'schema' ? 1 : 0);

  useEffect(() => {
    // sets the state value from the incoming search param
    setSelectedTabIndex(search.tab === 'feed' ? 2 : search.tab === 'schema' ? 1 : 0);
  }, [search.tab]);

  if (loading) {
    return <Loading />;
  }
  if (app == null) {
    // should not get hit since we handle this in the router loader. but fixes typecheck issues
    return <AppNotFoundEmptyState data={{ appId: params.appId }} />;
  }

  return (
    <TabGroup
      as="div"
      defaultIndex={0}
      selectedIndex={selectedTabIndex}
      onChange={setSelectedTabIndex}
      className="flex flex-col gap-y-4"
    >
      <nav aria-label="Back">
        <Link to="/" className="flex items-center text-sm font-medium text-gray-400 hover:text-gray-200">
          <ChevronLeftIcon aria-hidden="true" className="mr-1 -ml-1 size-5 shrink-0 text-gray-500" />
          Back
        </Link>
      </nav>
      <div className="border-b border-gray-200">
        <div className="sm:flex sm:items-baseline justify-between">
          <div className="flex items-baseline">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{app.name}</h3>
            <div className="mt-4 sm:mt-0 sm:ml-10">
              <TabList as="nav" className="-mb-px flex space-x-8">
                {[
                  { idx: 0, tab: 'Details', key: 'details' },
                  { idx: 1, tab: 'Schema', key: 'schema' },
                  { idx: 2, tab: 'Activity Feed', key: 'feed' },
                ].map((tab) => (
                  <Tab
                    key={tab.key}
                    as={Link}
                    to="/apps/$appId/details"
                    params={{ appId: String(app.id) } as UnknownLinkOptions}
                    search={{ tab: tab.key } as UnknownLinkOptions}
                    aria-current={selectedTabIndex === tab.idx ? 'true' : undefined}
                    data-current={selectedTabIndex === tab.idx ? 'true' : undefined}
                    className="border-b-2 border-transparent text-gray-500 hover:border-gray-300 dark:hover-border-white/40 hover:text-gray-700 dark:hover:text-gray-200 px-1 pb-4 text-sm font-medium whitespace-nowrap aria-[current]:border-indigo-500 dark:aria-[current]:border-indigo-300 aria-[current]:text-indigo-600 dark:aria-[current]:text-indigo-400 active:outline-none focus-visible:outline-none"
                  >
                    {tab.tab}
                  </Tab>
                ))}
              </TabList>
            </div>
          </div>
          <AppStatusBadge status={app.status} />
        </div>
      </div>
      <div className="mt-4">
        <TabPanels>
          <TabPanel>
            <dl className="divide-y divide-gray-100 dark:divide-white/10">
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">App name</dt>
                <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-200 sm:col-span-2 sm:mt-0">{app.name}</dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Description</dt>
                <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-200 sm:col-span-2 sm:mt-0">
                  {app.description}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Directory</dt>
                <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-200 sm:col-span-2 sm:mt-0">
                  {app.directory}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Created</dt>
                <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-200 sm:col-span-2 sm:mt-0">
                  <time dateTime={app.created_at}>{format(app.created_at, 'yyyy-MM-dd')}</time>
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Last updated</dt>
                <dd className="mt-1 text-sm/6 text-gray-700 dark:text-gray-200 sm:col-span-2 sm:mt-0">
                  <time dateTime={app.updated_at}>{format(app.updated_at, 'yyyy-MM-dd')}</time>
                </dd>
              </div>
            </dl>
          </TabPanel>
          <TabPanel>
            <SchemaPreview schema={app} />
          </TabPanel>
          <TabPanel>
            <div className="flow-root w-full max-w-5xl mx-auto">
              <ul className="-mb-8">
                {app.events.map((event, idx) => (
                  <li key={`app:${app.id}__event:${event.id}`}>
                    <div className="relative pb-8">
                      {idx !== app.events.length - 1 ? (
                        <span
                          aria-hidden="true"
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-white/20"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <EventTypeIcon event_type={event.event_type} />
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-300">{event.metadata}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                            <time dateTime={event.created_at}>{formatDistanceToNow(event.created_at)}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </TabPanel>
        </TabPanels>
      </div>
    </TabGroup>
  );
}

function AppNotFoundEmptyState(props: NotFoundRouteProps) {
  return (
    <div className="text-center">
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="mx-auto size-12 text-gray-400 dark:text-gray-200"
      >
        <path
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
        No App exists with id {(props.data as { appId: string }).appId}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">Get started by creating a new App.</p>
      <div className="mt-6">
        <Link
          to="/apps/create"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5" />
          New App
        </Link>
      </div>
    </div>
  );
}

function EventTypeIcon({ event_type }: Readonly<{ event_type: AppEvent['event_type'] }>) {
  switch (event_type) {
    case 'app_updated': {
      return (
        <span className="flex size-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-slate-900 bg-teal-700 dark:bg-teal-500">
          <PencilSquareIcon className="size-5 text-white" aria-hidden="true" />
        </span>
      );
    }
    case 'generated': {
      return (
        <span className="flex size-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-slate-900 bg-purple-700 dark:bg-purple-400">
          <CodeBracketIcon className="size-5 text-white" aria-hidden="true" />
        </span>
      );
    }
    case 'published': {
      return (
        <span className="flex size-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-slate-900 bg-indigo-700 dark:bg-indigo-400">
          <ArrowUpIcon className="size-5 text-white" aria-hidden="true" />
        </span>
      );
    }
    case 'schema_updated': {
      return (
        <span className="flex size-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-slate-900 bg-orange-700 dark:bg-orange-500">
          <CodeBracketSquareIcon className="size-5 text-white" aria-hidden="true" />
        </span>
      );
    }
    default: {
      return (
        <span className="flex size-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-slate-900 bg-green-800 dark:bg-green-400">
          <PlusIcon className="size-5 text-white" aria-hidden="true" />
        </span>
      );
    }
  }
}
