'use client';

import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, type ListboxProps } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/16/solid';
import { Array as EffectArray, String as EffectString, Schema, pipe } from 'effect';

import { useFieldContext } from '../../../../context/form.js';
import { classnames } from '../../../../utils/classnames.js';

class TypeOption extends Schema.Class<TypeOption>('/hypergraph/typesync/models/TypeOption')({
  id: Schema.NonEmptyTrimmedString,
  name: Schema.NonEmptyTrimmedString,
}) {}
class RelationTypeOption extends Schema.Class<RelationTypeOption>('/hypergraph/typesync/models/RelationTypeOption')({
  ...TypeOption.fields,
  relationType: Schema.NonEmptyTrimmedString,
}) {}

const typeOptions: Array<TypeOption> = [
  TypeOption.make({ id: 'DefaultEntityText', name: 'Text' }),
  TypeOption.make({ id: 'DefaultEntityNumber', name: 'Number' }),
  TypeOption.make({ id: 'DefaultEntityCheckbox', name: 'Checkbox' }),
  TypeOption.make({ id: 'DefaultEntityDate', name: 'Date' }),
  TypeOption.make({ id: 'DefaultEntityUrl', name: 'Url' }),
  TypeOption.make({ id: 'DefaultEntityPoint', name: 'Point' }),
];

export type TypeSelectProps = Pick<ListboxProps, 'disabled'> & {
  id: string;
  name: string;
  /**
   * A list of types within the defined schema that the user can use as a relation
   * This allows the user to specify the property as a relationship to a type in the schema
   *
   * @default []
   */
  schemaTypes?: Array<{ type: string; schemaTypeIdx: number }> | undefined;

  relationTypeSelected(relationType: string): void;
};
export function TypeSelect({
  id,
  name,
  schemaTypes = [],
  disabled = false,
  relationTypeSelected,
}: Readonly<TypeSelectProps>) {
  const field = useFieldContext<string>();

  const relationTypeOptions = pipe(
    schemaTypes,
    EffectArray.filter((_type) => EffectString.isNonEmpty(_type.type)),
    EffectArray.map((_type) =>
      RelationTypeOption.make({
        id: `Relation(${_type})`,
        name: `Relation(${_type.type})`,
        relationType: _type.type,
      }),
    ),
  );

  return (
    <Listbox
      as="div"
      id={id}
      name={name}
      value={field.state.value}
      onBlur={field.handleBlur}
      disabled={disabled}
      onChange={(value: string | RelationTypeOption | null) => {
        if (value) {
          if (typeof value === 'string') {
            field.handleChange(value);
            return;
          }
          field.handleChange(value.name);
          relationTypeSelected(value.relationType);
        }
      }}
    >
      <Label className="sr-only">Prop type</Label>
      <div className="relative">
        <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white dark:bg-slate-900 disabled:bg-gray-100 dark:disabled:bg-slate-700 py-1.5 pr-2 pl-3 text-left text-white outline-1 -outline-offset-1 outline-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 disabled:cursor-not-allowed">
          <span className="col-start-1 row-start-1 truncate pr-6 text-gray-950 dark:text-white">
            {field.state.value}
          </span>
          {!disabled ? (
            <ChevronUpDownIcon
              aria-hidden="true"
              className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-300 dark:text-gray-50 sm:size-4"
            />
          ) : null}
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-50 dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-gray-200 dark:ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
        >
          {typeOptions.map((type) => (
            <ListboxOption
              key={type.id}
              value={type.name}
              className="group relative cursor-default py-2 pr-9 pl-3 text-gray-800 dark:text-white select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
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
              value={type}
              className={classnames(
                'group relative cursor-default py-2 pr-9 pl-3 text-gray-800 dark:text-white select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden',
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
