'use client';

import { Input } from '@headlessui/react';
import { ExclamationCircleIcon, PlusIcon } from '@heroicons/react/16/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Array as EffectArray, pipe } from 'effect';
import {
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import type { InsertAppSchema } from '../../../schema.js';
import { SchemaBrowser } from './SchemaBrowser.js';
import { TypeCombobox } from './TypeCombobox.js';

export function SchemaBuilder() {
  const { control, register, formState, setValue } = useFormContext<InsertAppSchema>();
  const typesArray = useFieldArray({
    control,
    name: 'types',
    rules: {
      minLength: 1,
    },
  });

  const schema = useWatch<InsertAppSchema>({
    control,
    exact: true,
  });
  const schemaTypes = pipe(
    schema.types ?? [],
    EffectArray.filter((_type) => _type.name != null),
    EffectArray.map((_type) => _type.name || ''),
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-7 gap-x-4 pb-16">
      <div className="lg:col-span-4 flex flex-col gap-y-4">
        <div className="border-b border-gray-200 dark:border-white/20 pb-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Schema</h3>
          <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-200">
            Build your app schema by adding types, properties belonging to those types, etc. View already existing
            schemas, types and properties to add to your schema.
          </p>
        </div>
        {typesArray.fields.map((_type, idx) => (
          <div
            key={_type.id}
            className="border-l-2 border-indigo-600 dark:border-indigo-400 pl-2 py-2 flex flex-col gap-y-4"
          >
            <div className="flex items-center justify-between gap-x-3">
              <div className="flex-1 shrink-0">
                <div className="flex justify-between">
                  <label
                    htmlFor={`types.${idx}.name`}
                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                  >
                    Type Name*
                  </label>
                  <span id={`types-${idx}-name-required`} className="text-sm/6 text-gray-500">
                    Required
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-1">
                  <div
                    data-state={formState.errors?.types?.[idx]?.name?.message ? 'invalid' : undefined}
                    className="col-start-1 row-start-1 flex items-center rounded-md bg-white dark:bg-white/5 pl-3 outline -outline-offset-1 outline-gray-300 dark:outline-white/10 data-[state=invalid]:outline-red-300 dark:data-[state=invalid]:outline-red-600 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 dark:focus-within:outline-indigo-500 data-[state=invalid]:focus-within:outline-red-600 dark:data-[state=invalid]:focus-within:outline-red-400"
                  >
                    <Input
                      id={`types.${idx}.name`}
                      type="text"
                      {...register(`types.${idx}.name` as const, { required: true })}
                      data-state={formState.errors?.types?.[idx]?.name?.message ? 'invalid' : undefined}
                      aria-invalid={formState.errors?.types?.[idx]?.name?.message ? 'true' : undefined}
                      aria-describedby={
                        formState.errors?.types?.[idx]?.name?.message
                          ? `types-${idx}-name-invalid`
                          : `types-${idx}-name-required`
                      }
                      className="block min-w-0 grow py-1.5 pl-1 pr-3 data-[state=invalid]:pr-10 text-base text-gray-900 dark:text-white data-[state=invalid]:text-red-900 dark:data-[state=invalid]:text-red-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 data-[state=invalid]:placeholder:text-red-700 dark:data-[state=invalid]:placeholder:text-red-400 focus:outline sm:text-sm/6 focus-visible:outline-none"
                    />
                  </div>
                  {formState.errors?.types?.[idx]?.name?.message ? (
                    <ExclamationCircleIcon
                      aria-hidden="true"
                      className="pointer-events-none col-start-1 row-start-1 mr-3 size-5 self-center justify-self-end text-red-500 sm:size-4"
                    />
                  ) : null}
                </div>
                {formState.errors?.types?.[idx]?.name?.message ? (
                  <p id={`types-${idx}-name-invalid`} className="mt-2 text-sm text-red-600">
                    {formState.errors?.types?.[idx]?.name?.message}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                className="min-w-fit rounded-md bg-transparent p-2 shadow-xs hover:bg-gray-100 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 cursor-pointer mt-6 text-red-700 dark:text-red-400 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                onClick={() => typesArray.remove(idx)}
                disabled={(schema.types ?? []).length === 1}
              >
                <TrashIcon aria-hidden="true" className="size-5" />
              </button>
            </div>
            <PropsInput
              control={control}
              register={register}
              typeIndex={idx}
              setValue={setValue}
              schemaTypes={EffectArray.filter(schemaTypes, (_typeName) => {
                // filter out this type
                const schemaTypeNameAtIdx = schema.types?.[idx]?.name;
                return schemaTypeNameAtIdx != null && schemaTypeNameAtIdx !== _typeName;
              })}
            />
          </div>
        ))}
        <div className="w-full flex items-center justify-end border-t border-gray-500 dark:border-gray-400 mt-3">
          <button
            type="button"
            className="inline-flex items-center gap-x-1.5 text-sm/6 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-md px-2 py-1.5"
            onClick={() =>
              typesArray.append({
                name: '',
                properties: [{ name: '', type_name: 'Text' }],
              })
            }
          >
            <PlusIcon aria-hidden="true" className="-ml-0.5 size-5" />
            Add Type
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-y-4 lg:col-span-3">
        <SchemaBrowser
          typeSelected={(type) => {
            if (type.properties.length === 0) {
              // type is root type and not schema, add as property
              return;
            }
            typesArray.append({
              name: type.name || '',
              properties: type.properties.map((prop) => ({
                name: prop.name || '',
                type_name: prop.valueType?.name ?? 'Text',
                description: null,
                optional: null,
                nullable: null,
              })),
            });
          }}
        />
      </div>
    </div>
  );
}

function PropsInput(
  props: Readonly<{
    control: Control<InsertAppSchema>;
    register: UseFormRegister<InsertAppSchema>;
    typeIndex: number;
    setValue: UseFormSetValue<InsertAppSchema>;
    /**
     * A list of types within the defined schema that the user can use as a relation
     * This allows the user to specify the property as a relationship to a type in the schema
     *
     * @default []
     */
    schemaTypes?: Array<string>;
  }>,
) {
  const typePropertiesArray = useFieldArray({
    control: props.control,
    name: `types.${props.typeIndex}.properties` as const,
  });
  // this is annoying, but the control register is not picking up changes in the <Combobox> headless-ui type.
  // so, instead, grabbing the value and use the onChange to set in the form.
  // @todo FIX THIS
  const typeProperties = useWatch<InsertAppSchema>({
    control: props.control,
    exact: true,
  });
  const thisType = typeProperties.types?.[props.typeIndex];

  return (
    <div className="flex flex-col gap-y-1 pl-2 ml-1 border-l border-indigo-300">
      <h4 className="text-xl text-gray-800 dark:text-gray-200">Properties</h4>
      <div className="w-full flex flex-col gap-y-2">
        {typePropertiesArray.fields.map((_field, idx) => (
          <div key={_field.id} className="grid grid-cols-11 gap-2">
            <div className="col-span-5 flex items-center rounded-md bg-white dark:bg-white/5 pl-3 outline -outline-offset-1 outline-gray-300 dark:outline-white/10 data-[state=invalid]:outline-red-300 dark:data-[state=invalid]:outline-red-600 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 dark:focus-within:outline-indigo-500 data-[state=invalid]:focus-within:outline-red-600 dark:data-[state=invalid]:focus-within:outline-red-400">
              <Input
                id={`types.${props.typeIndex}.properties.${idx}.name`}
                type="text"
                {...props.register(`types.${props.typeIndex}.properties.${idx}.name` as const, { required: true })}
                className="block min-w-0 grow py-1.5 pl-1 pr-3 data-[state=invalid]:pr-10 text-base text-gray-900 dark:text-white data-[state=invalid]:text-red-900 dark:data-[state=invalid]:text-red-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 data-[state=invalid]:placeholder:text-red-700 dark:data-[state=invalid]:placeholder:text-red-400 focus:outline sm:text-sm/6 focus-visible:outline-none"
              />
            </div>
            <div className="col-span-5">
              <TypeCombobox
                typeIdx={props.typeIndex}
                typePropertyIdx={idx}
                value={thisType?.properties?.[idx]?.type_name || 'Text'}
                onTypeSelected={props.setValue}
                schemaTypes={props.schemaTypes}
              />
            </div>
            <div className="col-span-1 flex items-center justify-end">
              <button
                type="button"
                className="min-w-fit rounded-md bg-transparent p-2 text-white shadow-xs hover:bg-gray-100 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 cursor-pointer"
                onClick={() => typePropertiesArray.remove(idx)}
              >
                <TrashIcon aria-hidden="true" className="size-5 text-red-700 dark:text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full flex items-center justify-end mt-1">
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 text-sm/4 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-md px-2 py-1.5"
          onClick={() => typePropertiesArray.append({ name: '', type_name: 'Text' })}
        >
          <PlusIcon aria-hidden="true" className="-ml-0.5 size-4" />
          Add Property
        </button>
      </div>
    </div>
  );
}
