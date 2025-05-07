'use client';

import { PlusIcon } from '@heroicons/react/20/solid';
import { Link } from '@tanstack/react-router';

import { useAppsSuspenseQuery } from '../hooks/useAppQuery.js';

export function AppSpacesNavbar() {
  const { data: apps } = useAppsSuspenseQuery();

  return (
    <nav className="flex flex-1 flex-col px-6 border-r border-gray-200 dark:border-slate-900 ">
      <ul className="flex flex-1 flex-col gap-y-7">
        {apps.length > 0 ? (
          <li>
            <ul className="-mx-2 space-y-1">
              {apps.map((app) => (
                <li key={app.id}>
                  <Link
                    to="/apps/$appId/details"
                    params={{ appId: `${app.id}` }}
                    activeProps={{ className: 'bg-gray-100 dark:bg-slate-800' }}
                    className="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-white dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 dark:hover:text-white"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-300 dark:bg-gray-800 text-[0.625rem] font-medium text-gray-700 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white uppercase">
                      {app.name.substring(0, 1)}
                    </span>
                    <span className="flex flex-col gap-y-0.5">
                      <span className="truncate">{app.name}</span>
                      {app.directory ? (
                        <span className="text-gray-600 dark:text-gray-300 truncate text-[0.625rem]">
                          {app.directory.length > 30 ? `${app.directory.substring(0, 27)}...` : app.directory}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ) : null}
        <li>
          <ul className="-mx-2 mt-2 space-y-1">
            <li>
              <Link
                to="/apps/create"
                className="w-full rounded-full px-3 py-1.5 inline-flex items-center justify-center bg-indigo-600 text-white gap-x-2"
              >
                <PlusIcon className="size-5 text-white" aria-hidden="true" />
                Create App
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
}
