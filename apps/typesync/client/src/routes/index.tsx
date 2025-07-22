'use client';

import { ClockIcon, FolderOpenIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon, PlusIcon } from '@heroicons/react/24/solid';
import { createFileRoute, Link } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

import { AppStatusBadge } from '../Components/App/StatusBadge.js';
import { appsQueryOptions, useAppsSuspenseQuery } from '../hooks/useAppQuery.js';

export const Route = createFileRoute('/')({
  component: HomePage,
  async loader({ context }) {
    await context.queryClient.ensureQueryData(appsQueryOptions);
  },
});

function HomePage() {
  const { data: apps } = useAppsSuspenseQuery({
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchInterval: 20_000, // time in ms. helps to pickup changes
  });

  if (apps.length === 0) {
    return (
      <div className="w-full pt-48">
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
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">You have not created any apps.</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300 text-center">
            Get started by creating a new App, building the App schema, and generating the hypergraph schema code.
          </p>
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
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-y-6">
      <div className="border-b border-gray-200 dark:border-slate-500 pb-5 sm:flex sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Created TypeSync Apps</h3>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Link
            to="/apps/create"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create new App
          </Link>
        </div>
      </div>
      <ul className="w-full divide-y divide-gray-100 dark:divide-white/10">
        {apps.map((app) => (
          <Link
            key={app.id}
            to="/apps/$appId/details"
            params={{ appId: String(app.id) }}
            className="relative flex justify-between py-5 px-4 group"
          >
            <div className="flex gap-x-4 pr-6 w-1/2 flex-none">
              <div className="flex items-center justify-center text-xl size-12 shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-300 dark:bg-gray-800 uppercase">
                {app.name.substring(0, 1)}
              </div>
              <div className="min-w-0 flex-auto flex flex-col gap-y-1">
                <h2 className="min-w-0 text-lg font-semibold text-gray-950 dark:text-white flex items-center gap-x-3 group-hover:underline">
                  <span className="truncate">{app.name}</span>
                  <AppStatusBadge status={app.status} />
                </h2>
                {app.description ? (
                  <div className="flex items-center gap-x-2.5 text-xs/5 text-gray-600 dark:text-gray-400">
                    <p className="truncate">{app.description}</p>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-between gap-x-4 w-1/2 flex-none">
              <div className="flex flex-col gap-y-1">
                {app.directory ? (
                  <div className="flex items-center gap-x-2.5 text-xs/5 text-gray-600 dark:text-gray-400">
                    <FolderOpenIcon className="size-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                    <p className="truncate">{app.directory}</p>
                  </div>
                ) : null}
                <div className="flex items-center gap-x-2.5 text-xs/5 text-gray-500 dark:text-gray-300">
                  <ClockIcon className="size-4 text-gray-500 dark:text-gray-300" aria-hidden="true" />
                  <p className="truncate">
                    Created: <time dateTime={app.created_at}>{formatDistanceToNow(app.created_at)} ago</time>
                  </p>
                  <svg viewBox="0 0 2 2" className="size-0.5 flex-none text-gray-500 dark:fill-gray-300">
                    <title>separator</title>
                    <circle r={1} cx={1} cy={1} />
                  </svg>
                  <p className="whitespace-nowrap">
                    Last updated: <time dateTime={app.updated_at}>{formatDistanceToNow(app.updated_at)} ago</time>
                  </p>
                </div>
              </div>
              <ChevronRightIcon aria-hidden="true" className="size-5 flex-none text-gray-600 dark:text-gray-400" />
            </div>
          </Link>
        ))}
      </ul>
    </div>
  );
}
