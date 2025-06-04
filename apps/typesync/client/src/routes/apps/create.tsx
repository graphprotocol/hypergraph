'use client';

import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/20/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { useStore } from '@tanstack/react-form';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Array as EffectArray, String as EffectString, Schema, pipe } from 'effect';
import { useState } from 'react';

import { useAppForm } from '../../Components/App/CreateAppForm/useCreateAppForm.js';
import { appsQueryOptions, useCreateAppMutation } from '../../hooks/useAppQuery.js';
import { cwdQueryOptions, useCWDSuspenseQuery } from '../../hooks/useCWDQuery.js';
import reactLogo from '../../images/react_logo.png';
import viteLogo from '../../images/vitejs_logo.png';
import { type App, InsertAppSchema } from '../../schema.js';

const defaultValues: InsertAppSchema = {
  name: '',
  description: '',
  template: 'vite_react',
  directory: '',
  types: [{ name: '', properties: [{ name: '', type_name: 'Text' }] }],
};

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

  const { mutateAsync, isPending, isError, isSuccess } = useCreateAppMutation({
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
        // reset the form
        createAppForm.reset(undefined, { keepDefaultValues: true });
        // navigate user to the created app details page
        await navigate({ to: '/apps/$appId/details', params: { appId: `${data.id}` }, search: { tab: 'details' } });
      }, 1_500);
    },
    onError(error) {
      console.error('CreateAppPage. failure creating app', { error });
    },
  });

  const { data: cwd } = useCWDSuspenseQuery();

  const [selectedFormStep, setSelectedFormStep] = useState<'app_details' | 'schema' | 'generate'>('app_details');

  const createAppForm = useAppForm({
    defaultValues,
    validators: {
      onChangeAsyncDebounceMs: 100,
      onChange: Schema.standardSchemaV1(InsertAppSchema),
    },
    async onSubmit({ formApi, value }) {
      await mutateAsync(value);
    },
  });
  const formattedAppName = useStore(createAppForm.store, (state) =>
    pipe(state.values.name, EffectString.toLowerCase, EffectString.replaceAll(/\s/g, '-')),
  );
  const appTypes = useStore(createAppForm.store, (state) => EffectArray.map(state.values.types, (_type) => _type.name));

  return (
    <TabsPrimitive.Root
      defaultValue="app_details"
      onValueChange={(selected) => {
        if (isCreateAppFormTab(selected)) {
          setSelectedFormStep(selected);
        }
      }}
    >
      <form
        noValidate
        aria-disabled={isPending ? 'true' : undefined}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void createAppForm.handleSubmit();
        }}
      >
        <TabsPrimitive.Content value="app_details">
          <div className="space-y-12">
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 dark:border-white/10 pb-12">
                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Create New App</h2>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <createAppForm.AppField name="name">
                      {(field) => (
                        <field.FormComponentTextField
                          id="name"
                          name="name"
                          required
                          label="App name"
                          hint="App name must be unique"
                        />
                      )}
                    </createAppForm.AppField>
                  </div>

                  <div className="col-span-full">
                    <createAppForm.AppField name="description">
                      {(field) => (
                        <field.FormComponentTextArea
                          id="description"
                          name="description"
                          label="Description"
                          hint="Write a few sentences describing your application, what it's purpose is, etc."
                        />
                      )}
                    </createAppForm.AppField>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsPrimitive.Content>
        <TabsPrimitive.Content value="schema" className="pb-10">
          <div className="w-full flex flex-col gap-y-4 pb-10">
            <div className="border-b border-gray-200 dark:border-white/20 pb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Schema</h3>
              <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-200">
                Build your app schema by adding types, properties belonging to those types, etc. View already existing
                schemas, types and properties to add to your schema.
              </p>
            </div>
            <createAppForm.AppField name="types" mode="array">
              {(field) => (
                <div>
                  {field.state.value.map((_type, idx) => {
                    const typeEntryKey = `createAppForm__type[${idx}]`;
                    return (
                      <div
                        key={typeEntryKey}
                        className="border-l-2 border-indigo-600 dark:border-indigo-400 pl-2 py-2 flex flex-col gap-y-4"
                      >
                        <div className="flex items-center justify-between gap-x-3">
                          <div className="flex-1 shrink-0">
                            <createAppForm.AppField name={`types[${idx}].name` as const}>
                              {(subfield) => (
                                <subfield.FormComponentTextField
                                  id={`types[${idx}].name` as const}
                                  name={`types[${idx}].name` as const}
                                  required
                                  label="Type Name"
                                />
                              )}
                            </createAppForm.AppField>
                          </div>
                          <button
                            type="button"
                            className="min-w-fit rounded-md bg-transparent p-2 shadow-xs hover:bg-gray-100 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 cursor-pointer mt-6 text-red-700 dark:text-red-400 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            onClick={() => field.removeValue(idx)}
                            disabled={field.state.value.length === 1}
                          >
                            <TrashIcon aria-hidden="true" className="size-5" />
                          </button>
                        </div>
                        <createAppForm.AppField name={`types[${idx}].properties`} mode="array">
                          {(propsField) => (
                            <div className="flex flex-col gap-y-1 pl-2 ml-1 border-l border-indigo-300">
                              <h4 className="text-xl text-gray-800 dark:text-gray-200">Properties</h4>
                              <div className="w-full flex flex-col gap-y-2">
                                {propsField.state.value.map((_prop, typePropIdx) => {
                                  const typePropEntryKey = `createAppForm__type[${idx}]__prop[${typePropIdx}]`;
                                  return (
                                    <div key={typePropEntryKey} className="grid grid-cols-11 gap-2">
                                      <div className="col-span-5">
                                        <createAppForm.AppField
                                          name={`types[${idx}].properties[${typePropIdx}].name` as const}
                                        >
                                          {(subPropField) => (
                                            <subPropField.FormComponentTextField
                                              id={`types[${idx}].properties[${typePropIdx}].name` as const}
                                              name={`types[${idx}].properties[${typePropIdx}].name` as const}
                                              required
                                            />
                                          )}
                                        </createAppForm.AppField>
                                      </div>
                                      <div className="col-span-5">
                                        <createAppForm.AppField
                                          name={`types[${idx}].properties[${typePropIdx}].type_name` as const}
                                        >
                                          {(subPropField) => (
                                            <subPropField.TypeCombobox
                                              id={`types[${idx}].properties[${typePropIdx}].type_name` as const}
                                              name={`types[${idx}].properties[${typePropIdx}].type_name` as const}
                                              schemaTypes={EffectArray.filter(
                                                appTypes,
                                                (thisType) => thisType !== _type.name,
                                              )}
                                            />
                                          )}
                                        </createAppForm.AppField>
                                      </div>
                                      <div className="col-span-1 flex items-start justify-end h-full">
                                        <button
                                          type="button"
                                          className="min-w-fit rounded-md bg-transparent p-2 text-white shadow-xs hover:bg-gray-100 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 cursor-pointer"
                                          onClick={() => propsField.removeValue(typePropIdx)}
                                        >
                                          <TrashIcon
                                            aria-hidden="true"
                                            className="size-5 text-red-700 dark:text-red-400"
                                          />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                                <div className="w-full flex items-center justify-end mt-1">
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-x-1.5 text-sm/4 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-md px-2 py-1.5"
                                    onClick={() => propsField.pushValue({ name: '', type_name: 'Text' } as never)}
                                  >
                                    <PlusIcon aria-hidden="true" className="-ml-0.5 size-4" />
                                    Add Property
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </createAppForm.AppField>
                      </div>
                    );
                  })}
                  <div className="w-full flex items-center justify-end border-t border-gray-500 dark:border-gray-400 mt-4 pt-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-x-1.5 text-sm/6 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-md px-2 py-1.5"
                      onClick={() =>
                        field.pushValue({
                          name: '',
                          properties: [{ name: '', type_name: 'Text' }],
                        } as never)
                      }
                    >
                      <PlusIcon aria-hidden="true" className="-ml-0.5 size-5" />
                      Add Type
                    </button>
                  </div>
                </div>
              )}
            </createAppForm.AppField>
          </div>
        </TabsPrimitive.Content>
        <TabsPrimitive.Content value="generate">
          <div className="space-y-12">
            <div className="border-b border-gray-900/10 dark:border-white/10 pb-12">
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                Select a template and choose where to generate the app
              </h2>
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <createAppForm.AppField name="directory">
                    {(field) => (
                      <field.FormComponentTextField
                        id="directory"
                        name="directory"
                        required
                        label="Directory"
                        placeholder={`./${formattedAppName}`}
                        hint={
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
                        }
                      />
                    )}
                  </createAppForm.AppField>
                </div>
                <div className="col-span-full">
                  <createAppForm.AppField name="template">
                    {(field) => (
                      <field.FormComponentRadioGroup
                        id="template"
                        name="template"
                        label="Select a template"
                        options={[
                          {
                            key: 'vite_react',
                            value: 'vite_react',
                            'aria-label': 'Vitejs + React',
                            children: (
                              <>
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
                              </>
                            ),
                          },
                        ]}
                      />
                    )}
                  </createAppForm.AppField>
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
              key="forward__to__schema"
              value="schema"
              className="rounded-md bg-indigo-600 dark:bg-indigo-500 disabled:bg-gray-400 px-3 py-2 text-sm font-semibold text-white disabled:text-gray-900 shadow-xs hover:bg-indigo-500 dark:hover:bg-indigo-400 disabled:hover:bg-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500 disabled:focus-visible:outline-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-x-2 cursor-pointer"
            >
              Define Schema
              <ChevronRightIcon className="size-5" aria-hidden="true" />
            </TabsPrimitive.Trigger>
          ) : selectedFormStep === 'schema' ? (
            <div className="flex items-center gap-x-2">
              <TabsPrimitive.Trigger
                key="back__to__app_details"
                value="app_details"
                className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-xs hover:bg-gray-50 dark:hover:bg-white/20 ring-gray-300 dark:ring-white/30 ring-inset inline-flex items-center gap-x-1.5 cursor-pointer"
              >
                <ChevronLeftIcon className="size-5" aria-hidden="true" />
                Back
              </TabsPrimitive.Trigger>
              <TabsPrimitive.Trigger
                key="forward__to__generate"
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
                key="back__to__schema"
                value="schema"
                className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-xs hover:bg-gray-50 dark:hover:bg-white/20 ring-gray-300 dark:ring-white/30 ring-inset inline-flex items-center gap-x-1.5 cursor-pointer"
              >
                <ChevronLeftIcon className="size-5" aria-hidden="true" />
                Back
              </TabsPrimitive.Trigger>
              <createAppForm.AppForm>
                <createAppForm.SubmitButton
                  status={isPending ? 'submitting' : isError ? 'error' : isSuccess ? 'success' : 'idle'}
                >
                  Generate
                </createAppForm.SubmitButton>
              </createAppForm.AppForm>
            </div>
          )}
        </TabsPrimitive.List>
      </form>
    </TabsPrimitive.Root>
  );
}
