'use client';

import { Mapping, Typesync } from '@graphprotocol/hypergraph';
import { useHypergraphAuth } from '@graphprotocol/hypergraph-react';
import { ArrowCounterClockwiseIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { createFormHook, useStore } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router';
import { Array as EffectArray, String as EffectString, Option, pipe, Schema } from 'effect';

import { Checkbox } from '@/Components/Form/Checkbox.tsx';
import { fieldContext, formContext } from '@/Components/Form/form.ts';
import { SubmitButton } from '@/Components/Form/SubmitButton.tsx';
import { TextField } from '@/Components/Form/TextField.tsx';
import { InlineCode } from '@/Components/InlineCode.tsx';
import { KnowledgeGraphBrowser } from '@/Components/Schema/KnowledgeGraphBrowser.tsx';
import { PropertyCombobox } from '@/Components/Schema/PropertyCombobox.tsx';
import { SchemaPropertyStatus } from '@/Components/Schema/Status.tsx';
import { TypeCombobox } from '@/Components/Schema/TypeCombobox.tsx';
import { TypeSelect } from '@/Components/Schema/TypeSelect.tsx';
import { useAppSchemaSpace } from '@/Context/AppSchemaSpaceContext.tsx';
import { useHypergraphSchemaQuery } from '@/hooks/useHypergraphSchemaQuery.tsx';
import type { ExtendedProperty, ExtendedSchemaBrowserType } from '@/hooks/useKnowledgeGraph.tsx';
import { useSyncHypergraphMappingMutation } from '@/hooks/useSyncHypergraphMappingMutation.tsx';
import { useSyncHypergraphSchemaMutation } from '@/hooks/useSyncHypergraphSchemaMutation.tsx';
import { classnames } from '@/utils/classnames';
import { mapKGDataTypeToPrimitiveType } from '@/utils/type-mapper.ts';

export const Route = createFileRoute('/')({
  component: SchemaBuilderComponent,
});

const { useAppForm } = createFormHook({
  fieldComponents: {
    Checkbox,
    PropertyCombobox,
    TextField,
    TypeCombobox,
    TypeSelect,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});

function SchemaBuilderComponent() {
  const { authenticated } = useHypergraphAuth();
  const { spaceId } = useAppSchemaSpace();

  const { data: schema } = useHypergraphSchemaQuery();

  const {
    mutateAsync: syncSchemaMutateAsync,
    isError: syncSchemaIsError,
    isPending: syncSchemaIsPending,
    isSuccess: syncSchemaIsSuccess,
    reset: syncSchemaReset,
  } = useSyncHypergraphSchemaMutation();
  const {
    mutateAsync: syncMappingMutateAsync,
    isError: syncMappingIsError,
    isPending: syncMappingIsPending,
    isSuccess: syncMappingIsSuccess,
    reset: syncMappingReset,
  } = useSyncHypergraphMappingMutation();

  const createSchemaForm = useAppForm({
    defaultValues: schema,
    validators: {
      onChangeAsyncDebounceMs: 100,
      // biome-ignore lint/suspicious/noExplicitAny: fixes an issue with the prop.dataType type-string of `Relation(${name})`
      onChange: Schema.standardSchemaV1(Typesync.TypesyncHypergraphSchema) as any,
    },
    async onSubmit({ value, formApi }) {
      await syncSchemaMutateAsync(value).then((data) => {
        setTimeout(async () => {
          // reset the form
          formApi.reset(data);
          syncSchemaReset();
        }, 1_500);
      });
    },
  });
  const appTypes = useStore(createSchemaForm.store, (state) =>
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

  const currentSchema = useStore(createSchemaForm.store, (state) => state.values);

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
   *    name: Type.String,
   * }) {}
   *
   * export class Event extends Entity.Class<Event>('Event')({
   *    name: Type.String,
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
    mapped: Array<Typesync.TypesyncHypergraphSchemaType> = [],
  ) => {
    // map the relation properties into types to add to the schema
    const relationSchemaTypes: Array<Typesync.TypesyncHypergraphSchemaType> = [...mapped];

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
          status: null,
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
        status: 'published_not_synced',
        properties: EffectArray.map(relationValueType.properties ?? [], (prop) => {
          const dataType = mapKGDataTypeToPrimitiveType(prop.dataType, prop.name);
          if (Mapping.isDataTypeRelation(dataType)) {
            // need to recursively build type for property
            return {
              name: prop.name,
              knowledgeGraphId: prop.id,
              dataType,
              relationType: prop.name,
              status: 'published_not_synced',
            };
          }
          return {
            name: prop.name,
            knowledgeGraphId: prop.id,
            dataType,
            status: 'published_not_synced',
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
    return EffectArray.reduce(
      relationSchemaTypes,
      [] as Array<Typesync.TypesyncHypergraphSchemaType>,
      (final, curr) => {
        const existsInFinal = EffectArray.findFirst(final, ({ name }) => name === curr.name);
        if (Option.isNone(existsInFinal)) {
          final.push(curr);
        }
        return final;
      },
    );
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
    mapped: Array<Typesync.TypesyncHypergraphSchemaType> = [],
  ) => {
    const propRelationSchemaTypes: Array<Typesync.TypesyncHypergraphSchemaType> = [...mapped];

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
          if (Mapping.isDataTypeRelation(dataType)) {
            // relation type as a type to the schema if not existing
            // @todo, this should recursively find those types, with properties
            if (!alreadyAddedToSchema({ name })) {
              propRelationSchemaTypes.push({
                name,
                knowledgeGraphId: null,
                properties: [],
                status: null,
              });
            }

            return {
              name,
              knowledgeGraphId: prop.id,
              dataType,
              relationType: name,
              status: 'published_not_synced',
            } satisfies Typesync.TypesyncHypergraphSchemaTypeProperty;
          }
          return {
            name,
            knowledgeGraphId: prop.id,
            dataType,
            status: 'published_not_synced',
          } satisfies Typesync.TypesyncHypergraphSchemaTypeProperty;
        }),
      );
      propRelationSchemaTypes.push({
        name: relationValueType.name,
        knowledgeGraphId: relationValueType.id,
        status: 'published_not_synced',
        properties,
      });
    }

    return propRelationSchemaTypes;
  };

  return (
    <form
      noValidate
      aria-disabled={syncSchemaIsPending ? 'true' : undefined}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void createSchemaForm.handleSubmit();
      }}
    >
      <createSchemaForm.AppField name="types" mode="array">
        {(field) => (
          <div className="grid grid-cols-2 2xl:grid-cols-5 gap-x-4 2xl:gap-x-8 h-full">
            {/** KG schema browser */}
            <div className="w-full flex flex-col gap-y-4 pb-10 2xl:col-span-2 h-full">
              <KnowledgeGraphBrowser
                typeSelected={(selected) => {
                  if (selected.name == null) {
                    return;
                  }
                  const relationSchemaTypes = mapSelectedTypeRelationPropertiesToTypes(selected);

                  const selectedMappedToType = Typesync.TypesyncHypergraphSchemaType.make({
                    name: selected.name,
                    knowledgeGraphId: selected.id,
                    status: 'published_not_synced',
                    properties: (selected.properties ?? [])
                      .filter((prop) => prop != null)
                      .map((prop) => {
                        const dataType = mapKGDataTypeToPrimitiveType(prop.dataType, prop.name || prop.id);
                        if (Mapping.isDataTypeRelation(dataType)) {
                          return {
                            name: prop.name || prop.id,
                            knowledgeGraphId: prop.id,
                            dataType,
                            relationType: prop.name || prop.id,
                            status: 'published_not_synced',
                          } satisfies Typesync.TypesyncHypergraphSchemaTypeProperty;
                        }
                        return {
                          name: prop.name || prop.id,
                          knowledgeGraphId: prop.id,
                          dataType,
                          status: 'published_not_synced',
                        } satisfies Typesync.TypesyncHypergraphSchemaTypeProperty;
                      }),
                  });
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
            {/** Hypergraph schema builder */}
            <div className="w-full flex flex-col gap-y-4 pb-10 2xl:col-span-3">
              <div className="border-b border-gray-200 dark:border-white/20 pb-5 h-20">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Schema</h3>
                <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-200">
                  This is parsed from the Hypergraph Schema defined in your <InlineCode>schema.ts</InlineCode>
                </p>
              </div>
              <div>
                {field.state.value.map((_type, idx) => {
                  const typeEntryKey = `createSchemaForm__type[${idx}]`;

                  return (
                    <div
                      key={typeEntryKey}
                      className="border-l-2 border-indigo-600 dark:border-indigo-400 pl-2 py-2 flex flex-col gap-y-4"
                    >
                      <div className="flex items-start justify-between gap-x-3">
                        <div className="h-16 w-8 flex flex-col items-center justify-center">
                          <SchemaPropertyStatus status={_type.status} />
                        </div>
                        <div className="flex-1 shrink-0">
                          <createSchemaForm.AppField name={`types[${idx}].name` as const}>
                            {(subfield) => (
                              <subfield.TypeCombobox
                                id={`types[${idx}].name` as const}
                                name={`types[${idx}].name` as const}
                                required
                                label="Type Name"
                                typeSelected={(selected) => {
                                  const relationSchemaTypes = mapSelectedTypeRelationPropertiesToTypes(selected);
                                  const selectedMappedToType = Typesync.TypesyncHypergraphSchemaType.make({
                                    name: selected.name,
                                    knowledgeGraphId: selected.id,
                                    status: 'published_not_synced',
                                    properties: (selected.properties ?? [])
                                      .filter((prop) => prop != null)
                                      .map((prop) => {
                                        const dataType = mapKGDataTypeToPrimitiveType(
                                          prop.dataType,
                                          prop.name || prop.id,
                                        );
                                        if (Mapping.isDataTypeRelation(dataType)) {
                                          return {
                                            name: prop.name || prop.id,
                                            knowledgeGraphId: prop.id,
                                            dataType,
                                            relationType: prop.name || prop.id,
                                            status: 'published_not_synced',
                                          } satisfies Typesync.TypesyncHypergraphSchemaTypeProperty;
                                        }
                                        return {
                                          name: prop.name || prop.id,
                                          knowledgeGraphId: prop.id,
                                          dataType,
                                          status: 'published_not_synced',
                                        } satisfies Typesync.TypesyncHypergraphSchemaTypeProperty;
                                      }),
                                  });
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
                          </createSchemaForm.AppField>
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
                      <createSchemaForm.AppField name={`types[${idx}].properties` as const} mode="array">
                        {(propsField) => (
                          <div className="flex flex-col gap-y-1 pl-2 ml-1 border-l border-indigo-300">
                            <h4 className="text-md font-mono text-gray-800 dark:text-gray-200">Properties</h4>
                            <div className="w-full flex flex-col gap-y-2">
                              {propsField.state.value.map((_prop, typePropIdx) => {
                                const typePropEntryKey = `createAppForm__type[${idx}]__prop[${typePropIdx}]`;
                                return (
                                  <div key={typePropEntryKey} className="grid grid-cols-11 2xl:grid-cols-12 gap-2">
                                    <div className="col-span-1 size-full flex flex-col items-center justify-center">
                                      <SchemaPropertyStatus status={_prop.status} />
                                    </div>
                                    <div className="col-span-4 2xl:grid-cols-5">
                                      <createSchemaForm.AppField
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
                                                status: 'published_not_synced',
                                                dataType,
                                                ...(Mapping.isDataTypeRelation(dataType)
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
                                      </createSchemaForm.AppField>
                                    </div>
                                    <div className="col-span-3 2xl:col-span-4">
                                      <createSchemaForm.AppField
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
                                      </createSchemaForm.AppField>
                                    </div>
                                    <div className="col-span-2 2xl:col-span-1">
                                      <createSchemaForm.AppField
                                        name={`types[${idx}].properties[${typePropIdx}].optional` as const}
                                      >
                                        {(subPropField) => (
                                          <subPropField.Checkbox
                                            id={`types[${idx}].properties[${typePropIdx}].optional` as const}
                                            name={`types[${idx}].properties[${typePropIdx}].optional` as const}
                                            label="Optional"
                                          />
                                        )}
                                      </createSchemaForm.AppField>
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
                                      status: null,
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
                      </createSchemaForm.AppField>
                    </div>
                  );
                })}
                <div className="w-full flex items-center justify-between border-t border-gray-500 dark:border-gray-400 mt-4 pt-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-x-1.5 text-sm/6 font-semibold text-gray-600 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-md px-2 py-1.5"
                    onClick={() => {
                      createSchemaForm.resetField('types');
                    }}
                  >
                    <ArrowCounterClockwiseIcon aria-hidden="true" className="-ml-0.5 size-4" />
                    Reset
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-x-1.5 text-sm/6 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-md px-2 py-1.5"
                    onClick={() =>
                      field.pushValue({
                        name: '',
                        knowledgeGraphId: null,
                        status: null,
                        properties: [{ name: '', knowledgeGraphId: null, dataType: 'String', status: null }],
                      } as never)
                    }
                  >
                    <PlusIcon aria-hidden="true" className="-ml-0.5 size-5" />
                    Add Type
                  </button>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-x-6 bg-white dark:bg-inherit p-4 rounded-lg">
                <createSchemaForm.AppForm>
                  <createSchemaForm.SubmitButton
                    status={
                      syncSchemaIsPending
                        ? 'submitting'
                        : syncSchemaIsError
                          ? 'error'
                          : syncSchemaIsSuccess
                            ? 'success'
                            : 'idle'
                    }
                  >
                    Sync with <InlineCode>schema.ts</InlineCode>
                  </createSchemaForm.SubmitButton>
                </createSchemaForm.AppForm>
                {spaceId != null && authenticated ? (
                  <button
                    type="button"
                    disabled={false /* should be disabled if user has no schema changes to publish to the KG */}
                    data-state={
                      syncMappingIsPending
                        ? 'submitting'
                        : syncMappingIsError
                          ? 'error'
                          : syncMappingIsSuccess
                            ? 'success'
                            : 'idle'
                    }
                    className={classnames(
                      'rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500 inline-flex items-center gap-x-2 cursor-pointer',
                      'disabled:bg-gray-400 disabled:text-gray-900 disabled:hover:bg-gray-400 disabled:focus-visible:outline-gray-400 disabled:cursor-not-allowed',
                      'data-[state=error]:bg-red-600 data-[state=error]:hover:bg-red-500 data-[state=error]:focus-visible:bg-red-500 data-[state=success]:focus-visible:bg-green-500',
                      'data-[state=success]:bg-green-600 data-[state=success]:hover:bg-green-500',
                    )}
                    onClick={async () => {
                      await syncMappingMutateAsync({
                        schema: currentSchema,
                        space: spaceId,
                      }).then((updatedSchema) => {
                        setTimeout(async () => {
                          // reset the form
                          createSchemaForm.reset(updatedSchema);
                          syncMappingReset();
                        }, 1_500);
                      });
                    }}
                  >
                    Publish Schema
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </createSchemaForm.AppField>
    </form>
  );
}
