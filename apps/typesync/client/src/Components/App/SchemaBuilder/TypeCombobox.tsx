'use client';

import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/16/solid';
import { Array as EffectArray, String as EffectString, Schema, pipe } from 'effect';
import type { UseFormSetValue } from 'react-hook-form';

import type { InsertAppSchema } from '../../../schema.js';
import { classnames } from '../../../utils/classnames.js';

class TypeOption extends Schema.Class<TypeOption>('/hypergraph/typesync/models/TypeOption')({
  id: Schema.NonEmptyTrimmedString,
  name: Schema.NonEmptyTrimmedString,
}) {}
class RelationTypeOption extends Schema.Class<RelationTypeOption>('/hypergraph/typesync/models/RelationTypeOption')({
  ...TypeOption.fields,
  relationToEntity: Schema.NonEmptyTrimmedString,
}) {}

const typeOptions: Array<TypeOption> = [
  TypeOption.make({ id: 'DefaultEntityText', name: 'Text' }),
  TypeOption.make({ id: 'DefaultEntityNumber', name: 'Number' }),
  TypeOption.make({ id: 'DefaultEntityBoolean', name: 'Boolean' }),
  TypeOption.make({ id: 'DefaultEntityDate', name: 'Date' }),
  TypeOption.make({ id: 'DefaultEntityUrl', name: 'Url' }),
  TypeOption.make({ id: 'DefaultEntityPoint', name: 'Point' }),
];

export function TypeCombobox({
  typePropertyIdx,
  typeIdx,
  value,
  onTypeSelected,
  schemaTypes = [],
}: Readonly<{
  /** the index of this type selection field in the properties array. Types.AppSchemaForm.types[idx].properties[typeInputIdx] */
  typePropertyIdx: number;
  /** the index of the type within the schema array Types.AppSchemaForm.types[typeIdx] */
  typeIdx: number;
  /** the current value */
  value: string;
  /** set the value in the form when the user selects a value */
  onTypeSelected: UseFormSetValue<InsertAppSchema>;
  /**
   * A list of types within the defined schema that the user can use as a relation
   * This allows the user to specify the property as a relationship to a type in the schema
   *
   * @default []
   */
  schemaTypes?: Array<string> | undefined;
}>) {
  const relationTypeOptions = pipe(
    schemaTypes,
    EffectArray.filter((_type) => EffectString.isNonEmpty(_type)),
    EffectArray.map((_type) =>
      RelationTypeOption.make({ id: `Relation(${_type})`, name: `Relation(${_type})`, relationToEntity: _type }),
    ),
  );

  return (
    <Listbox
      as="div"
      id={`types.${typeIdx}.properties.${typePropertyIdx}.type_name`}
      name={`types.${typeIdx}.properties.${typePropertyIdx}.type_name`}
      value={value}
      onChange={(value) => {
        if (value) {
          onTypeSelected(`types.${typeIdx}.properties.${typePropertyIdx}.type_name`, value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }
      }}
    >
      <Label className="sr-only">Prop type</Label>
      <div className="relative">
        <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-slate-900 py-1.5 pr-2 pl-3 text-left text-white outline-1 -outline-offset-1 outline-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
          <span className="col-start-1 row-start-1 truncate pr-6">{value}</span>
          <ChevronUpDownIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-300 sm:size-4"
          />
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
        >
          {typeOptions.map((type) => (
            <ListboxOption
              key={type.id}
              value={type.name}
              className="group relative cursor-default py-2 pr-9 pl-3 text-white select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
            >
              <span className="block truncate font-normal group-data-selected:font-semibold">{type.name}</span>

              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                <CheckIcon aria-hidden="true" className="size-5" />
              </span>
            </ListboxOption>
          ))}
          {relationTypeOptions.map((type, idx) => (
            <ListboxOption
              key={type.id}
              value={type.name}
              className={classnames(
                'group relative cursor-default py-2 pr-9 pl-3 text-white select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden',
                idx === 0 ? 'border-t border-gray-400 dark:border-white/10' : '',
              )}
            >
              <span className="block truncate font-normal group-data-selected:font-semibold">{type.name}</span>

              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                <CheckIcon aria-hidden="true" className="size-5" />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
