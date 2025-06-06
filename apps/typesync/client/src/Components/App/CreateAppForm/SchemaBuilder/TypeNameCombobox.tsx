'use client';

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  type ComboboxInputProps,
  ComboboxOption,
  ComboboxOptions,
  Label,
} from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/16/solid';
import { useStore } from '@tanstack/react-form';
import { Array as EffectArray, String as EffectString } from 'effect';
import { useState } from 'react';

import { useFieldContext } from '../../../../context/form.js';
import { type ExtendedSchemaBrowserType, useSchemaBrowserQuery } from '../../../../hooks/useSchemaBrowserQuery.js';
import { classnames } from '../../../../utils/classnames.js';
import { ErrorMessages } from '../../../FormComponents/ErrorMessages.js';
import { InlineCode } from '../../../InlineCode.js';

export type TypeNameComboboxProps = Omit<ComboboxInputProps, 'id'> & {
  id: string;
  label?: React.ReactNode;
  typeSelected(type: ExtendedSchemaBrowserType): void;
};
export function TypeNameCombobox({ id, label, typeSelected, ...rest }: Readonly<TypeNameComboboxProps>) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);
  const touched = useStore(field.store, (state) => state.meta.isTouched);
  const hasErrors = errors.length > 0 && touched;

  const [typesFilter, setTypesFilter] = useState('');

  const { data: types } = useSchemaBrowserQuery({
    refetchOnMount: false,
    select(data) {
      if (EffectString.isEmpty(typesFilter)) {
        return data;
      }
      return EffectArray.filter(data, (type) => type.slug.includes(typesFilter));
    },
  });

  return (
    <Combobox
      as="div"
      id={id}
      value={field.state.value}
      onChange={(val) => {
        if (val == null) {
          field.handleChange('');
          return;
        }
        if (typeof val === 'string') {
          field.handleChange(val);
          return;
        }
        field.handleChange(val);
        // emit the change
        typeSelected(val);
      }}
      onClose={() => setTypesFilter('')}
      immediate
    >
      {label != null ? (
        <Label htmlFor={rest.name || id} className="block text-sm/6 font-medium text-gray-900 dark:text-white">
          {label}
          {rest.required ? '*' : ''}
        </Label>
      ) : null}
      <div className={classnames('grid grid-cols-1 relative', label != null ? 'mt-2' : 'mt-0')}>
        <ComboboxInput
          className="block min-w-0 grow py-1.5 pr-12 data-[state=invalid]:pr-10 text-base bg-white dark:bg-white/5 pl-3 outline -outline-offset-1 outline-gray-300 dark:outline-white/10 rounded-md text-gray-900 dark:text-white data-[state=invalid]:text-red-900 dark:data-[state=invalid]:text-red-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 data-[state=invalid]:placeholder:text-red-700 dark:data-[state=invalid]:placeholder:text-red-400 focus:outline sm:text-sm/6 focus-visible:outline-none"
          onChange={(event) => {
            const value = event.target.value;
            setTypesFilter(value);
            field.handleChange(value);
          }}
          onBlur={() => setTypesFilter('')}
          displayValue={(selectedType: string) => selectedType}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-hidden">
          <ChevronUpDownIcon className="size-5 text-gray-400 dark:text-gray-50" aria-hidden="true" />
        </ComboboxButton>

        {(types ?? []).length > 0 ? (
          <ComboboxOptions className="absolute z-10 mt-10 max-h-60 w-fit min-w-xl overflow-auto rounded-md bg-white dark:bg-slate-700 py-1 text-base shadow-lg ring-1 ring-black/5 dark:ring-black/10 focus:outline-hidden sm:text-sm">
            {(types ?? []).map((_type) => (
              <ComboboxOption
                key={_type.id}
                value={_type}
                className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 dark:text-white select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
              >
                <span className="flex items-center gap-x-1.5 truncate group-data-selected:font-semibold">
                  {_type.name || _type.id}
                  <InlineCode>{_type.id}</InlineCode>
                </span>

                <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-focus:text-white group-data-selected:flex">
                  <CheckIcon className="size-5" aria-hidden="true" />
                </span>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        ) : null}
        {hasErrors ? <ErrorMessages id={`${id}-invalid`} errors={errors} /> : null}
      </div>
    </Combobox>
  );
}
