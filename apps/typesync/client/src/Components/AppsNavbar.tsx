'use client';

import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, PlusIcon } from '@heroicons/react/20/solid';
import { Link } from '@tanstack/react-router';
import { atom, useAtom } from 'jotai';

import { useAppsSuspenseQuery } from '../hooks/useAppQuery.js';
import { classnames } from '../utils/classnames.js';

export const navbarExpandedAtom = atom(false);

export function AppSpacesNavbar() {
  const { data: apps } = useAppsSuspenseQuery();

  const [navbarExpanded, setNavbarExpanded] = useAtom(navbarExpandedAtom);

  return (
    <nav
      className={classnames(
        'flex flex-1 flex-col border-r border-gray-200 dark:border-slate-900 2xl:px-6 2xl:w-72 py-6 h-full transition-opacity duration-300 ease-linear',
        navbarExpanded ? 'w-72 px-6' : 'w-16 px-2',
      )}
    >
      <ul className="flex flex-1 flex-col gap-y-7 h-full">
        {apps.length > 0 ? (
          <li>
            <ul className="-mx-2 space-y-1">
              {apps.map((app) => (
                <li key={app.id}>
                  <Link
                    to="/apps/$appId/details"
                    params={{ appId: `${app.id}` }}
                    activeProps={{ className: 'bg-gray-100 dark:bg-slate-800' }}
                    className={classnames(
                      'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-white dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 dark:hover:text-white w-full',
                      navbarExpanded ? '' : 'w-full flex items-center justify-center',
                    )}
                  >
                    <span
                      className={classnames(
                        '2xl:size-10 flex shrink-0 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-300 dark:bg-gray-800 text-[0.625rem] font-medium text-gray-700 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white uppercase',
                        navbarExpanded ? 'size-10' : 'size-10',
                      )}
                    >
                      {app.name.substring(0, 1)}
                    </span>
                    <span
                      className={classnames(
                        'gap-y-0.5 2xl:flex 2xl:flex-col grow w-full',
                        navbarExpanded ? 'flex flex-col' : 'hidden',
                      )}
                    >
                      <span className="truncate flex-1">{app.name}</span>
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
            <li className="w-full flex items-center justify-center">
              <Link
                to="/apps/create"
                className={classnames(
                  '2xl:w-full rounded-full 2xl:px-3 py-1.5 inline-flex items-center justify-center bg-indigo-600 text-white gap-x-2',
                  navbarExpanded ? 'px-3 w-full' : 'px-1.5 w-fit',
                )}
              >
                <PlusIcon className="size-5 text-white" aria-hidden="true" />
                <span className={classnames('2xl:block', navbarExpanded ? 'block' : 'hidden')}>Create App</span>
              </Link>
            </li>
          </ul>
        </li>
        <li className="mt-auto 2xl:hidden w-full flex items-center justify-center">
          <button
            type="button"
            onClick={() => setNavbarExpanded((curr) => !curr)}
            className="2xl:hidden inline-flex items-center justify-center rounded-md p-2 bg-gray-100 dark:bg-slate-700 ring-1 ring-gray-200 dark:ring-slate-800 cursor-pointer transition-all duration-200 ease-in-out transform"
          >
            {navbarExpanded ? (
              <ChevronDoubleLeftIcon className="size-4 text-white transition-all" aria-hidden="true" />
            ) : (
              <ChevronDoubleRightIcon className="size-4 text-white transition-all" aria-hidden="true" />
            )}
          </button>
        </li>
      </ul>
    </nav>
  );
}
