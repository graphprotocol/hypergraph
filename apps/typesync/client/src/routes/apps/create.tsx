'use client';

import { Radio, RadioGroup } from '@headlessui/react';
import { CheckIcon, ExclamationCircleIcon } from '@heroicons/react/16/solid';
import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Link, createFileRoute } from '@tanstack/react-router';
import * as Schema from 'effect/Schema';
import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { SchemaBuilder } from '../../Components/App/SchemaBuilder/SchemaBuilder.js';
import { Loading } from '../../Components/Loading.js';
import { appsQueryOptions, useAppsSuspenseQuery, useCreateAppMutation } from '../../hooks/useAppQuery.js';
import { cwdQueryOptions, useCWDSuspenseQuery } from '../../hooks/useCWDQuery.js';
import reactLogo from '../../images/react_logo.png';
import viteLogo from '../../images/vitejs_logo.png';
import { type App, InsertAppSchema } from '../../schema.js';

// biome-ignore lint/suspicious/noExplicitAny: appears to be an issue with the effectTsResolver
type HookformEffectSchema = any;

const CreateAppFormTab = Schema.Literal('app_details', 'schema', 'generate');
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
    // prefetch the CWD from the api
    await context.queryClient.ensureQueryData(cwdQueryOptions);
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
  const { data: cwd } = useCWDSuspenseQuery();

  const [selectedFormStep, setSelectedFormStep] = useState<'app_details' | 'schema' | 'generate'>('app_details');
  const [appNameNotUnique, setAppNameNotUnique] = useState(false);

  const methods = useForm<InsertAppSchema>({
    resolver: effectTsResolver(InsertAppSchema as HookformEffectSchema),
    mode: 'all',
    defaultValues: {
      name: '',
      description: '',
      directory: '',
      // @todo add more templates
      template: 'vite_react',
      types: [{ name: '', properties: [{ name: '', type_name: 'Text' }] }],
    },
    shouldFocusError: true,
  });
  const { control, formState, handleSubmit, register } = methods;

  const onSubmit = (app: InsertAppSchema) => {
    // check if the user already has an app with the submitted name
    const existing = apps.find((_app) => _app.name.toLowerCase() === app.name.toLowerCase());
    if (existing) {
      setAppNameNotUnique(true);
      return;
    }

    mutate(app);
  };

  const schema = useWatch<InsertAppSchema>({
    control,
    exact: true,
  });
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
      <FormProvider<InsertAppSchema> {...methods}>
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
          <TabsPrimitive.Content value="generate">
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 dark:border-white/10 pb-12">
                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                  Select a template and choose where to generate the app
                </h2>
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                      Directory*
                    </label>
                    <div className="mt-2 grid grid-cols-1">
                      <div
                        data-state={formState.errors.directory != null ? 'invalid' : undefined}
                        className="col-start-1 row-start-1 flex items-center rounded-md bg-white dark:bg-white/5 pl-3 outline -outline-offset-1 outline-gray-300 dark:outline-white/10 data-[state=invalid]:outline-red-300 dark:data-[state=invalid]:outline-red-600 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 dark:focus-within:outline-indigo-500 data-[state=invalid]:focus-within:outline-red-600 dark:data-[state=invalid]:focus-within:outline-red-400"
                      >
                        <input
                          id="directory"
                          type="text"
                          {...register('directory')}
                          placeholder={`./${schema.name?.trim().toLowerCase().replaceAll(/\s/g, '-') || ''}`}
                          data-state={formState.errors.directory != null ? 'invalid' : undefined}
                          aria-invalid={formState.errors.directory != null ? 'true' : undefined}
                          aria-describedby={
                            formState.errors.directory != null ? 'directory-invalid' : 'directory-help-text'
                          }
                          className="block min-w-0 grow py-1.5 pl-1 pr-3 data-[state=invalid]:pr-10 text-base text-gray-900 dark:text-white data-[state=invalid]:text-red-900 dark:data-[state=invalid]:text-red-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 data-[state=invalid]:placeholder:text-red-700 dark:data-[state=invalid]:placeholder:text-red-400 focus:outline sm:text-sm/6 focus-visible:outline-none"
                        />
                      </div>
                    </div>
                    {formState.errors.directory?.message != null ? (
                      <p id="directory-invalid" className="mt-2 text-sm text-red-600 dark:text-red-500">
                        Entered directory is invalid
                      </p>
                    ) : (
                      <div className="mt-3 flex flex-col gap-y-1.5">
                        <p className="text-sm/6 text-gray-400" id="directory-help-text">
                          Can be relative to your current working directory, or a full path
                        </p>
                        <p className="text-sm/6 text-gray-400">
                          Current working directory:{' '}
                          <code className="font-mono bg-gray-50 dark:bg-black dark:text-white p-1 rounded-sm">
                            {cwd.cwd}
                          </code>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="col-span-full">
                    <fieldset>
                      <legend className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                        Select a template
                      </legend>
                      <RadioGroup
                        id="template"
                        {...register('template')}
                        className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-x-4"
                      >
                        <Radio
                          key="vite_react"
                          value="vite_react"
                          aria-label="Vitejs + React"
                          className="group relative flex cursor-pointer rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-700 p-4 shadow-xs focus:outline-hidden data-focus:border-indigo-600 dark:data-focus:border-indigo-500 data-focus:ring-2 data-focus:ring-indigo-600 dark:data-focus:ring-indigo-500"
                        >
                          <div className="flex flex-1 w-full">
                            <div className="flex flex-col gap-y-2 w-full">
                              <span className="block text-sm font-medium text-gray-900 dark:text-white">
                                Vite + React
                              </span>
                              <div className="flex items-center justify-between gap-x-4 w-fit">
                                <img src={viteLogo} alt="" width={64} height={64} className="size-16" />
                                <span className="text-gray-500 dark:text-gray-50">+</span>
                                <img src={reactLogo} alt="" width={64} height={64} className="size-16" />
                              </div>
                            </div>
                          </div>
                          <CheckCircleIcon
                            aria-hidden="true"
                            className="size-5 text-indigo-600 dark:text-indigo-300 group-not-data-checked:invisible"
                          />
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-checked:border-indigo-600 group-data-focus:border"
                          />
                        </Radio>
                      </RadioGroup>
                    </fieldset>
                  </div>
                </div>
              </div>
            </div>
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
            ) : selectedFormStep === 'schema' ? (
              <div className="flex items-center gap-x-2">
                <TabsPrimitive.Trigger
                  value="app_details"
                  className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-xs hover:bg-gray-50 dark:hover:bg-white/20 ring-gray-300 dark:ring-white/30 ring-inset inline-flex items-center gap-x-1.5 cursor-pointer"
                >
                  <ChevronLeftIcon className="size-5" aria-hidden="true" />
                  Back
                </TabsPrimitive.Trigger>
                <TabsPrimitive.Trigger
                  value="generate"
                  className="rounded-md bg-indigo-600 dark:bg-indigo-500 disabled:bg-gray-400 px-3 py-2 text-sm font-semibold text-white disabled:text-gray-900 shadow-xs hover:bg-indigo-500 dark:hover:bg-indigo-400 disabled:hover:bg-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500 disabled:focus-visible:outline-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-x-2 cursor-pointer"
                >
                  Select template &amp; generate
                  <ChevronRightIcon className="size-5" aria-hidden="true" />
                </TabsPrimitive.Trigger>
              </div>
            ) : (
              <div className="flex items-center gap-x-2">
                <TabsPrimitive.Trigger
                  value="schema"
                  className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-xs hover:bg-gray-50 dark:hover:bg-white/20 ring-gray-300 dark:ring-white/30 ring-inset inline-flex items-center gap-x-1.5 cursor-pointer"
                >
                  <ChevronLeftIcon className="size-5" aria-hidden="true" />
                  Back
                </TabsPrimitive.Trigger>
                <button
                  type="submit"
                  disabled={appNameNotUnique || !formState.isValid || !formState.isDirty}
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
      </FormProvider>
    </TabsPrimitive.Root>
  );
}
