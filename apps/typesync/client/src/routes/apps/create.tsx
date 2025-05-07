'use client';

import { CheckIcon, ExclamationCircleIcon } from '@heroicons/react/16/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Link, createFileRoute } from '@tanstack/react-router';
import * as Schema from 'effect/Schema';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { SchemaBuilder } from '../../Components/App/SchemaBuilder/SchemaBuilder.js';
import { Loading } from '../../Components/Loading.js';
import { appsQueryOptions, useAppsSuspenseQuery, useCreateAppMutation } from '../../hooks/useAppQuery.js';
import { type App, InsertAppSchema } from '../../schema.js';

// biome-ignore lint/suspicious/noExplicitAny: appears to be an issue with the effectTsResolver
type HookformEffectSchema = any;

const CreateAppFormTab = Schema.Literal('app_details', 'schema');
type CreateAppFormTab = typeof CreateAppFormTab.Type;
function isCreateAppFormTab(value: unknown): value is CreateAppFormTab {
  try {
    Schema.decodeUnknownSync(CreateAppFormTab)(value);
    return true;
  } catch (err) {
    return false;
  }
}

export const Route = createFileRoute('/apps/create')({
  component: CreateAppPage,
  async loader({ context }) {
    // preload apps from the api. will be used in the AppSpacesNavbar component
    await context.queryClient.ensureQueryData(appsQueryOptions);
  },
});

function CreateAppPage() {
  const ctx = Route.useRouteContext();
  const navigate = Route.useNavigate();

  const { mutate, isPending, isSuccess, isError } = useCreateAppMutation({
    async onSuccess(data) {
      // add the created app to the apps query dataset
      ctx.queryClient.setQueryData<Readonly<Array<App>>, readonly ['Space', 'Apps']>(
        ['Space', 'Apps'] as const,
        (current) => [...(current ?? []), data],
      );
      // add the created app to the app details query dataset
      ctx.queryClient.setQueryData<Readonly<App>, readonly ['Space', 'Apps', 'details', string | number]>(
        ['Space', 'Apps', 'details', data.id] as const,
        data,
      );
      // once the app is created, navigate to the app details page
      setTimeout(async () => {
        await navigate({ to: '/apps/$appId/details', params: { appId: `${data.id}` }, search: { tab: 'details' } });
      }, 1_500);
    },
    onError(error) {
      console.error('CreateAppPage. failure creating app', { error });
    },
  });

  const { data: apps } = useAppsSuspenseQuery();

  const [selectedFormStep, setSelectedFormStep] = useState<'app_details' | 'schema'>('app_details');
  const [appNameNotUnique, setAppNameNotUnique] = useState(false);

  const { register, formState, handleSubmit } = useForm<InsertAppSchema>({
    resolver: effectTsResolver(InsertAppSchema as HookformEffectSchema),
    mode: 'all',
    defaultValues: {
      name: '',
      description: '',
    },
    shouldFocusError: true,
  });

  const onSubmit = (app: InsertAppSchema) => {
    // check if the user already has an app with the submitted name
    const existing = apps.find((_app) => _app.name.toLowerCase() === app.name.toLowerCase());
    if (existing) {
      setAppNameNotUnique(true);
      return;
    }

    mutate(app);
  };

  const appNameInvalid =
    (formState.errors.name?.message != null || appNameNotUnique) && formState.dirtyFields.name === true;

  return (
    <TabsPrimitive.Root
      defaultValue="app_details"
      onValueChange={(selected) => {
        if (isCreateAppFormTab(selected)) {
          setSelectedFormStep(selected);
        }
      }}
    >
      <form noValidate aria-disabled={isPending ? 'true' : undefined} onSubmit={handleSubmit(onSubmit)}>
        <TabsPrimitive.Content value="app_details">
          <div className="space-y-12">
            <div className="border-b border-gray-900/10 dark:border-white/10 pb-12">
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Create New App</h2>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                    App Name*
                  </label>
                  <div className="mt-2 grid grid-cols-1">
                    <div
                      data-state={appNameInvalid ? 'invalid' : undefined}
                      className="col-start-1 row-start-1 flex items-center rounded-md bg-white dark:bg-white/5 pl-3 outline -outline-offset-1 outline-gray-300 dark:outline-white/10 data-[state=invalid]:outline-red-300 dark:data-[state=invalid]:outline-red-600 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 dark:focus-within:outline-indigo-500 data-[state=invalid]:focus-within:outline-red-600 dark:data-[state=invalid]:focus-within:outline-red-400"
                    >
                      <input
                        id="name"
                        type="text"
                        {...register('name')}
                        placeholder="Event tracker..."
                        data-state={appNameInvalid ? 'invalid' : undefined}
                        aria-invalid={appNameInvalid ? 'true' : undefined}
                        aria-describedby={appNameInvalid ? 'name-invalid' : undefined}
                        className="block min-w-0 grow py-1.5 pl-1 pr-3 data-[state=invalid]:pr-10 text-base text-gray-900 dark:text-white data-[state=invalid]:text-red-900 dark:data-[state=invalid]:text-red-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 data-[state=invalid]:placeholder:text-red-700 dark:data-[state=invalid]:placeholder:text-red-400 focus:outline sm:text-sm/6 focus-visible:outline-none"
                      />
                    </div>
                    {appNameInvalid ? (
                      <ExclamationCircleIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-3 size-5 self-center justify-self-end text-red-500 sm:size-4"
                      />
                    ) : null}
                  </div>
                  {appNameInvalid ? (
                    <p id="name-invalid" className="mt-2 text-sm text-red-600">
                      {appNameNotUnique ? 'App names must be unique' : 'App name is required.'}
                    </p>
                  ) : null}
                </div>

                <div className="col-span-full">
                  <label htmlFor="description" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                    App description
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="description"
                      {...register('description')}
                      rows={3}
                      className="block w-full rounded-md bg-white dark:bg-white/5 px-3 py-1.5 text-base text-gray-900 dark:text-white outline -outline-offset-1 outline-gray-300 dark:outline-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:focus:outline-indigo-500 sm:text-sm/6"
                    />
                  </div>
                  <p className="mt-3 text-sm/6 text-gray-400">
                    Write a few sentences describing your application, what it's purpose is, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsPrimitive.Content>
        <TabsPrimitive.Content value="schema">
          <SchemaBuilder />
        </TabsPrimitive.Content>

        <TabsPrimitive.List className="mt-6 flex items-center justify-end gap-x-6">
          <Link to="/" className="text-sm/6 font-semibold text-gray-900 dark:text-white">
            Cancel
          </Link>
          {selectedFormStep === 'app_details' ? (
            <TabsPrimitive.Trigger
              value="schema"
              disabled={appNameNotUnique}
              className="rounded-md bg-indigo-600 dark:bg-indigo-500 disabled:bg-gray-400 px-3 py-2 text-sm font-semibold text-white disabled:text-gray-900 shadow-xs hover:bg-indigo-500 dark:hover:bg-indigo-400 disabled:hover:bg-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500 disabled:focus-visible:outline-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-x-2 cursor-pointer"
            >
              Define Schema
              <ChevronRightIcon className="size-5" aria-hidden="true" />
            </TabsPrimitive.Trigger>
          ) : (
            <div className="flex items-center gap-x-2">
              <TabsPrimitive.Trigger
                value="app_details"
                className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-xs hover:bg-gray-50 dark:hover:bg-white/20 ring-gray-300 dark:ring-white/30 ring-inset inline-flex items-center gap-x-2  cursor-pointer"
              >
                <ChevronLeftIcon className="size-5" aria-hidden="true" />
                Back
              </TabsPrimitive.Trigger>
              <button
                type="submit"
                disabled={appNameNotUnique}
                data-state={isError ? 'error' : isSuccess ? 'success' : 'idle'}
                className="rounded-md bg-indigo-600 dark:bg-indigo-500 disabled:bg-gray-400 data-[state=error]:bg-red-600 data-[state=success]:bg-green-600 px-3 py-2 text-sm font-semibold text-white disabled:text-gray-900 shadow-xs hover:bg-indigo-500 dark:hover:bg-indigo-400 data-[state=error]:hover:bg-red-500 data-[state=success]:hover:bg-green-500 disabled:hover:bg-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500 data-[state=error]:focus-visible:bg-red-500 data-[state=success]:focus-visible:bg-green-500 disabled:focus-visible:outline-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-x-2 cursor-pointer"
              >
                {isPending ? (
                  <Loading />
                ) : isSuccess ? (
                  <>
                    <CheckIcon className="size-5 text-white" aria-hidden="true" />
                    Created!
                  </>
                ) : isError ? (
                  <>
                    <ExclamationCircleIcon className="size-5 text-white" aria-hidden="true" />
                    Error
                  </>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          )}
        </TabsPrimitive.List>
      </form>
    </TabsPrimitive.Root>
  );
}
