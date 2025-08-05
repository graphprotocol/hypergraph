'use client';

import { isDataTypeRelation } from '@graphprotocol/typesync/Mapping';
import {
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@heroicons/react/20/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { useStore } from '@tanstack/react-form';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Array as EffectArray, String as EffectString, Option, pipe, Schema } from 'effect';
import { useState } from 'react';

import { InsertAppSchema } from '../../../../domain/Domain.js';

import { SchemaBrowser } from '../../Components/App/CreateAppForm/SchemaBuilder/SchemaBrowser.js';
import { useAppForm } from '../../Components/App/CreateAppForm/useCreateAppForm.js';
import { appsQueryOptions, useCreateAppMutation } from '../../hooks/useAppQuery.js';
import { cwdQueryOptions, useCWDSuspenseQuery } from '../../hooks/useCWDQuery.js';
import type { ExtendedProperty, ExtendedSchemaBrowserType } from '../../hooks/useSchemaBrowserQuery.js';
import reactLogo from '../../images/react_logo.png';
import viteLogo from '../../images/vitejs_logo.png';
import type { App } from '../../schema.js';
import { mapKGDataTypeToPrimitiveType } from '../../utils/mapper.js';

const defaultValues: InsertAppSchema = {
  name: '',
  description: '',
  template: 'vite_react',
  directory: '',
  types: [
    {
      name: '',
      knowledgeGraphId: null,
      properties: [{ name: '', knowledgeGraphId: null, dataType: 'String' }],
    },
  ],
};

const CreateAppFormTab = Schema.Literal('app_details', 'schema', 'generate');
type CreateAppFormTab = typeof CreateAppFormTab.Type;
function isCreateAppFormTab(value: unknown): value is CreateAppFormTab {
  try {
    Schema.decodeUnknownSync(CreateAppFormTab)(value);
    return true;
  } catch (_err) {
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
      // biome-ignore lint/suspicious/noExplicitAny: fixes an issue with the prop.dataType type-string of `Relation(${name})`
      onChange: Schema.standardSchemaV1(InsertAppSchema) as any,
    },
    async onSubmit({ formApi, value }) {
      await mutateAsync(value).then(() => formApi.reset(undefined, { keepDefaultValues: true }));
    },
  });
  const formattedAppName = useStore(createAppForm.store, (state) =>
    pipe(state.values.name, EffectString.toLowerCase, EffectString.replaceAll(/\s/g, '-')),
  );
  const appTypes = useStore(createAppForm.store, (state) =>
    pipe(
      state.values.types,
      EffectArray.filter((_type) => EffectString.isNonEmpty(_type.name)),
      EffectArray.map((_type, _idx) => ({
        type: _type.name,
        knowledgeGraphId: _type.knowledgeGraphId,
        schemaTypeIdx: _idx,
      })),
    ),
  );
  // unique set of the types in the users schema that were added from the knowledge graph.
  // this way, if the user has a type: Country in their schema and add the property/type: State,
  // even if it is a _different_ type, we will use the "Country" already declared in the schema
  const unqSchemaTypes = pipe(
    appTypes,
    EffectArray.map((schemaType) => schemaType.type),
    EffectArray.reduce(new Set<string>(), (set, curr) => set.add(curr)),
  );

  /**
   * If the user selects an already existing type from the Knowledge Graph,
   * that type, and all of its properties are added as types to the users app schema.
   * This encourages type/property reuse within the Hypergraph ecosystem.
   *
   * These types could have properties of `dataType === 'RELATION'`.
   * This means the property is a relation to another type in the Knowledge Graph.
   *
   * When we add a property to the schema, of type `RELATION`, the generated hypergraph schema will look like this:
   *
   * ```ts
   * // src/schema.ts
   *
   * import { Entity, Type } from '@graphprotocol/hypergraph'
   *
   * export class Account extends Entity.Class<Account>('Account')({
   *    name: Type.Text,
   * }) {}
   *
   * export class Event extends Entity.Class<Event>('Event')({
   *    name: Type.Text,
   * }) {}
   *
   * export class Attendance extends Entity.Class<Attendance>('Attendance')({
   *    event: Type.Relation(Event),
   *    attendee: Type.Relation(Account)
   * }) {}
   * ```
   *
   * In order for this to compile `Type.Relation({entity})` must _exist_ in the schema.
   * So when the user selects a type from the Knowledge Graph, we need to go through that selected types properties,
   * and for each property of `dataType === 'RELATION'`, we need to add the relation type into the schema as well.
   *
   * This fn maps through the selected type properties, and for each `RELATION`,
   * attempts to resolve that relation type from the Knowledge Graph.
   * This is a recursive lookup because if the `RELATION` type has properties that are relations,
   * these types also need to be brought into the schema.
   *
   * If no type can be found in the Knowledge Graph, we create a default type with the name and default: name, description properties
   *
   * @todo handle another layer of nesting
   * @todo update the form to inform user if a type is missing
   *
   * @param selected the user-selected type already existing on the Knowledge Graph to add to the schema
   * @param mapped already existing added types to the schema for the recursive lookup
   * @returns an array of mapped relation properties -> types to add to the users schema
   */
  const mapSelectedTypeRelationPropertiesToTypes = (
    selected: ExtendedSchemaBrowserType,
    mapped: Array<InsertAppSchema['types'][number]> = [],
  ) => {
    // map the relation properties into types to add to the schema
    const relationSchemaTypes: Array<InsertAppSchema['types'][number]> = [...mapped];

    function alreadyAddedToSchema<T extends { readonly name: string }>(type: T): boolean {
      return (
        EffectArray.length(EffectArray.filter(relationSchemaTypes, ({ name }) => name === type.name)) > 0 &&
        !unqSchemaTypes.has(type.name)
      );
    }

    // grab all the properties from the type where the dataType is `RELATION` and create as a type on the Schema
    const relationProperties = pipe(
      selected.properties,
      EffectArray.filter((prop) => prop.dataType === 'RELATION'),
      EffectArray.filter((prop) => !alreadyAddedToSchema({ name: prop.name })),
    );

    for (const relationProp of relationProperties) {
      if (EffectArray.isEmptyReadonlyArray(relationProp.relationValueTypes)) {
        // inform the user they need to create a type for the relation
        relationSchemaTypes.push({
          name: relationProp.name,
          knowledgeGraphId: null,
          properties: [],
        });
        continue;
      }
      const relationValueType = relationProp.relationValueTypes[0];

      // check if already exists in schema
      if (alreadyAddedToSchema({ name: relationValueType.name })) {
        continue;
      }

      relationSchemaTypes.push({
        name: relationValueType.name,
        knowledgeGraphId: relationValueType.id,
        properties: EffectArray.map(relationValueType.properties ?? [], (prop) => {
          const dataType = mapKGDataTypeToPrimitiveType(prop.dataType, prop.name);
          if (isDataTypeRelation(dataType)) {
            // need to recursively build type for property
            return {
              name: prop.name,
              knowledgeGraphId: prop.id,
              dataType,
              relationType: prop.name,
            };
          }
          return {
            name: prop.name,
            knowledgeGraphId: prop.id,
            dataType,
          };
        }),
      });

      // recursively lookup for relation value type
      const nestedTypes = mapSelectedTypeRelationPropertiesToTypes(
        {
          ...relationValueType,
          slug: '',
          properties: pipe(
            relationValueType.properties ?? [],
            EffectArray.filter((prop) => prop != null),
            EffectArray.map((prop) => ({ ...prop, relationValueTypes: [] })),
          ),
        },
        relationSchemaTypes,
      );
      // merge new types into array
      for (const nestedType of nestedTypes) {
        if (!alreadyAddedToSchema({ name: nestedType.name })) {
          relationSchemaTypes.push(nestedType);
        }
      }
    }

    // perform one final check for uniqueness on type name
    // @todo figure out why this is needed in logic above.
    return EffectArray.reduce(relationSchemaTypes, [] as Array<InsertAppSchema['types'][number]>, (final, curr) => {
      const existsInFinal = EffectArray.findFirst(final, ({ name }) => name === curr.name);
      if (Option.isNone(existsInFinal)) {
        final.push(curr);
      }
      return final;
    });
  };

  /**
   * Similar to the `mapSelectedTypeRelationPropertiesToTypes` function above,
   * takes the user-selected relation data type property, and maps its relationValueTypes into the schema
   *
   * @todo handle another layer of nesting
   * @todo update the form to inform user if a type is missing
   *
   * @param property selected RELATION property
   * @param mapped allows for recursive build of types
   * @returns the types to add to the schema from the properties of the relation type
   */
  const mapSelectedRelationPropertyTypesToSchema = (
    property: ExtendedProperty,
    mapped: Array<InsertAppSchema['types'][number]> = [],
  ) => {
    const propRelationSchemaTypes: Array<InsertAppSchema['types'][number]> = [...mapped];

    function alreadyAddedToSchema<T extends { readonly name: string }>(type: T): boolean {
      return (
        EffectArray.length(EffectArray.filter(propRelationSchemaTypes, ({ name }) => name === type.name)) > 0 &&
        !unqSchemaTypes.has(type.name)
      );
    }

    for (const relationValueType of EffectArray.filter(property.relationValueTypes, (type) => type != null)) {
      if (relationValueType.name == null || alreadyAddedToSchema({ name: relationValueType.name })) {
        continue;
      }
      const properties = pipe(
        relationValueType.properties ?? [],
        EffectArray.filter((prop) => prop.name != null),
        EffectArray.map((prop) => {
          // biome-ignore lint/style/noNonNullAssertion: filtered out above
          const name = prop.name!;

          const dataType = mapKGDataTypeToPrimitiveType(prop.dataType, name);
          if (isDataTypeRelation(dataType)) {
            // relation type as a type to the schema if not existing
            // @todo, this should recursively find those types, with properties
            if (!alreadyAddedToSchema({ name })) {
              propRelationSchemaTypes.push({
                name,
                knowledgeGraphId: null,
                properties: [],
              });
            }

            return {
              name,
              knowledgeGraphId: prop.id,
              dataType,
              relationType: name,
            };
          }
          return {
            name,
            knowledgeGraphId: prop.id,
            dataType,
          };
        }),
      );
      propRelationSchemaTypes.push({
        name: relationValueType.name,
        knowledgeGraphId: relationValueType.id,
        properties,
      });
    }

    return propRelationSchemaTypes;
  };

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
                          onChange={(e) => {
                            createAppForm.setFieldValue(
                              'directory',
                              `./${pipe(e.target.value, EffectString.toLowerCase, EffectString.replaceAll(/\s/g, '-'))}`,
                            );
                          }}
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
          <createAppForm.AppField name="types" mode="array">
            {(field) => (
              <div className="grid grid-cols-2 2xl:grid-cols-3 gap-x-4 2xl:gap-x-8">
                <div className="w-full flex flex-col gap-y-4 pb-10">
                  <SchemaBrowser
                    typeSelected={(selected) => {
                      if (selected.name == null) {
                        return;
                      }
                      const relationSchemaTypes = mapSelectedTypeRelationPropertiesToTypes(selected);

                      const selectedMappedToType = {
                        name: selected.name,
                        knowledgeGraphId: selected.id,
                        properties: (selected.properties ?? [])
                          .filter((prop) => prop != null)
                          .map((prop) => {
                            const dataType = mapKGDataTypeToPrimitiveType(prop.dataType, prop.name || prop.id);
                            if (isDataTypeRelation(dataType)) {
                              return {
                                name: prop.name || prop.id,
                                knowledgeGraphId: prop.id,
                                dataType,
                                relationType: prop.name || prop.id,
                              };
                            }
                            return {
                              name: prop.name || prop.id,
                              knowledgeGraphId: prop.id,
                              dataType,
                            };
                          }),
                      } satisfies InsertAppSchema['types'][number];
                      // if schema is currently empty, set as first type
                      if (field.state.value.length === 1) {
                        const initialType = field.state.value[0];
                        const properties = initialType.properties;
                        if (
                          EffectString.isEmpty(initialType.name) &&
                          properties.length === 1 &&
                          EffectString.isEmpty(initialType.properties[0].name)
                        ) {
                          EffectArray.match(relationSchemaTypes, {
                            onEmpty() {
                              field.replaceValue(0, selectedMappedToType as never);
                            },
                            onNonEmpty(mappedRelationTypes) {
                              EffectArray.forEach(mappedRelationTypes, (mapped, idx) => {
                                if (idx === 0) {
                                  field.replaceValue(0, {
                                    name: mapped.name,
                                    knowledgeGraphId: mapped.knowledgeGraphId,
                                    properties: mapped.properties,
                                  } as never);
                                  return;
                                }
                                field.pushValue(mapped as never);
                              });
                              // push selected type
                              field.pushValue(selectedMappedToType as never);
                            },
                          });
                          return;
                        }
                      }
                      // add any relation types, and the selected type, as a new Type on the schema
                      EffectArray.match(relationSchemaTypes, {
                        onEmpty() {
                          field.pushValue(selectedMappedToType as never);
                        },
                        onNonEmpty(mappedRelationTypes) {
                          EffectArray.forEach(mappedRelationTypes, (mapped) => {
                            field.pushValue({
                              name: mapped.name,
                              knowledgeGraphId: mapped.knowledgeGraphId,
                              properties: mapped.properties,
                            } as never);
                          });
                          // push selected type
                          field.pushValue(selectedMappedToType as never);
                        },
                      });
                      return;
                    }}
                  />
                </div>
                <div className="w-full flex flex-col gap-y-4 pb-10 2xl:col-span-2">
                  <div className="border-b border-gray-200 dark:border-white/20 pb-5 h-20">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Schema</h3>
                    <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-200">
                      Build your app schema by adding types, properties belonging to those types, etc.
                    </p>
                  </div>
                  <div>
                    {field.state.value.map((_type, idx) => {
                      const typeEntryKey = `createAppForm__type[${idx}]`;
                      return (
                        <div
                          key={typeEntryKey}
                          className="border-l-2 border-indigo-600 dark:border-indigo-400 pl-2 py-2 flex flex-col gap-y-4"
                        >
                          <div className="flex items-start justify-between gap-x-3">
                            <div className="flex-1 shrink-0">
                              <createAppForm.AppField name={`types[${idx}].name` as const}>
                                {(subfield) => (
                                  <subfield.TypeNameCombobox
                                    id={`types[${idx}].name` as const}
                                    name={`types[${idx}].name` as const}
                                    required
                                    label="Type Name"
                                    typeSelected={(selected) => {
                                      const relationSchemaTypes = mapSelectedTypeRelationPropertiesToTypes(selected);

                                      const selectedMappedToType = {
                                        name: selected.name,
                                        knowledgeGraphId: selected.id,
                                        properties: (selected.properties ?? [])
                                          .filter((prop) => prop != null)
                                          .map((prop) => {
                                            const dataType = mapKGDataTypeToPrimitiveType(
                                              prop.dataType,
                                              prop.name || prop.id,
                                            );
                                            if (isDataTypeRelation(dataType)) {
                                              return {
                                                name: prop.name || prop.id,
                                                knowledgeGraphId: prop.id,
                                                dataType,
                                                relationType: prop.name || prop.id,
                                              };
                                            }
                                            return {
                                              name: prop.name || prop.id,
                                              knowledgeGraphId: prop.id,
                                              dataType,
                                            };
                                          }),
                                      } satisfies InsertAppSchema['types'][number];
                                      // add any relation types to the schema (that don't already exist),
                                      // and the selected type as a new Type on the schema
                                      EffectArray.match(relationSchemaTypes, {
                                        onEmpty() {
                                          field.replaceValue(idx, selectedMappedToType as never);
                                        },
                                        onNonEmpty(mappedRelationTypes) {
                                          EffectArray.forEach(mappedRelationTypes, (mapped) => {
                                            field.pushValue({
                                              name: mapped.name,
                                              knowledgeGraphId: mapped.knowledgeGraphId,
                                              properties: mapped.properties,
                                            } as never);
                                          });
                                          field.replaceValue(idx, selectedMappedToType as never);
                                        },
                                      });
                                    }}
                                  />
                                )}
                              </createAppForm.AppField>
                            </div>
                            <button
                              type="button"
                              className="min-w-fit rounded-md bg-transparent p-2 shadow-xs hover:bg-gray-100 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 cursor-pointer mt-8 text-red-700 dark:text-red-400 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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
                                              <subPropField.PropertyCombobox
                                                id={`types[${idx}].properties[${typePropIdx}].name` as const}
                                                name={`types[${idx}].properties[${typePropIdx}].name` as const}
                                                required
                                                propertySelected={(prop) => {
                                                  const dataType = mapKGDataTypeToPrimitiveType(
                                                    prop.dataType,
                                                    prop.name || prop.id,
                                                  );
                                                  const selectedProp = {
                                                    name: prop.name || prop.id,
                                                    knowledgeGraphId: prop.id,
                                                    dataType,
                                                    ...(isDataTypeRelation(dataType)
                                                      ? { relationType: prop.name || prop.id }
                                                      : {}),
                                                  } as never;
                                                  if (prop.dataType === 'RELATION') {
                                                    // if the user selects a property that is a relation,
                                                    // - attempt to find the type from the types query
                                                    // - add as a type (with nested types) to the schema
                                                    const propRelatedEntityTypes =
                                                      mapSelectedRelationPropertyTypesToSchema(prop);
                                                    EffectArray.forEach(propRelatedEntityTypes, (mapped) => {
                                                      field.pushValue({
                                                        name: mapped.name,
                                                        knowledgeGraphId: mapped.knowledgeGraphId,
                                                        properties: mapped.properties,
                                                      } as never);
                                                    });

                                                    propsField.replaceValue(typePropIdx, selectedProp);
                                                    return;
                                                  }
                                                  propsField.replaceValue(typePropIdx, selectedProp);
                                                }}
                                              />
                                            )}
                                          </createAppForm.AppField>
                                        </div>
                                        <div className="col-span-5">
                                          <createAppForm.AppField
                                            name={`types[${idx}].properties[${typePropIdx}].dataType` as const}
                                          >
                                            {(subPropField) => (
                                              <subPropField.TypeSelect
                                                id={`types[${idx}].properties[${typePropIdx}].dataType` as const}
                                                name={`types[${idx}].properties[${typePropIdx}].dataType` as const}
                                                schemaTypes={EffectArray.filter(
                                                  appTypes,
                                                  (thisType) => thisType.type !== _type.name,
                                                )}
                                                disabled={_prop.knowledgeGraphId != null}
                                                relationTypeSelected={(relationType) =>
                                                  // replace this property in the array to set the selected relationType value
                                                  propsField.replaceValue(typePropIdx, {
                                                    ...propsField.state.value[typePropIdx],
                                                    relationType,
                                                  } as never)
                                                }
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
                                      onClick={() =>
                                        propsField.pushValue({
                                          name: '',
                                          knowledgeGraphId: null,
                                          dataType: 'String',
                                        } as never)
                                      }
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
                    <div className="w-full flex items-center justify-between border-t border-gray-500 dark:border-gray-400 mt-4 pt-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-x-1.5 text-sm/6 font-semibold text-gray-600 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-md px-2 py-1.5"
                        onClick={() => createAppForm.resetField('types')}
                      >
                        <ArrowUturnLeftIcon aria-hidden="true" className="-ml-0.5 size-4" />
                        Reset
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-x-1.5 text-sm/6 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-md px-2 py-1.5"
                        onClick={() =>
                          field.pushValue({
                            name: '',
                            knowledgeGraphId: null,
                            properties: [{ name: '', knowledgeGraphId: null, dataType: 'String' }],
                          } as never)
                        }
                      >
                        <PlusIcon aria-hidden="true" className="-ml-0.5 size-5" />
                        Add Type
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </createAppForm.AppField>
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

        <TabsPrimitive.List className="mt-6 flex items-center justify-end gap-x-6 fixed bottom-4 right-4 bg-white dark:bg-inherit p-4 rounded-lg">
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
