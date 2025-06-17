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
import { type ExtendedProperty, usePropertiesQuery } from '../../../../hooks/useSchemaBrowserQuery.js';
import { classnames } from '../../../../utils/classnames.js';
import { mapKGDataTypeToPrimitiveType } from '../../../../utils/mapper.js';
import { ErrorMessages } from '../../../FormComponents/ErrorMessages.js';
import { InlineCode } from '../../../InlineCode.js';

export type PropertyCombobox = Omit<ComboboxInputProps, 'id'> & {
  id: string;
  label?: React.ReactNode;
  propertySelected(prop: ExtendedProperty): void;
};
export function PropertyCombobox({ id, label, propertySelected, ...rest }: Readonly<PropertyCombobox>) {
  const field = useFieldContext<string>();
  const value = useStore(field.store, (state) => state.value);
  const errors = useStore(field.store, (state) => state.meta.errors);
  const touched = useStore(field.store, (state) => state.meta.isTouched);
  const hasErrors = errors.length > 0 && touched;

  const [propsFilter, setPropsFilter] = useState('');

  const { data } = usePropertiesQuery({
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    select(data) {
      if (EffectString.isEmpty(propsFilter)) {
        return data;
      }
      return EffectArray.filter(data, (prop) => prop.slug.includes(propsFilter.toLowerCase()));
    },
  });
  const props = data ?? [];

  return (
    <Combobox<ExtendedProperty | string>
      value={value}
      onChange={(val) => {
        if (val == null) {
          field.handleChange('');
          return;
        }
        if (typeof val === 'string') {
          field.handleChange(val);
          return;
        }
        field.handleChange(val.entity.name || val.id);
        propertySelected(val);
      }}
      onClose={() => setPropsFilter('')}
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
            setPropsFilter(value);
            field.handleChange(value);
          }}
          onBlur={() => setPropsFilter('')}
          displayValue={(selectedType: string) => selectedType}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-hidden cursor-pointer">
          <ChevronUpDownIcon className="size-5 text-gray-400 dark:text-gray-50" aria-hidden="true" />
        </ComboboxButton>

        {props.length > 0 || EffectString.isNonEmpty(propsFilter) ? (
          <ComboboxOptions className="absolute z-10 mt-10 max-h-60 w-fit min-w-xl overflow-auto rounded-md bg-white dark:bg-slate-700 py-1 text-base shadow-lg ring-1 ring-black/5 dark:ring-black/10 focus:outline-hidden sm:text-sm">
            {props.map((_prop) => (
              <ComboboxOption
                key={_prop.id}
                value={_prop}
                data-selected={value === _prop.entity.name || value === _prop.id ? true : undefined}
                className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 dark:text-white select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
              >
                <div className="flex-auto flex flex-col gap-y-1">
                  <div className="flex items-center justify-between gap-x-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-100 group-data-focus:text-gray-900 dark:group-data-focus:text-white flex items-center gap-x-1.5">
                      {_prop.entity.name || _prop.id}
                      <InlineCode>
                        {mapKGDataTypeToPrimitiveType(_prop.dataType, _prop.entity.name || _prop.id)}
                      </InlineCode>
                    </p>
                    <p className="w-fit">
                      <InlineCode>{_prop.id}</InlineCode>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-300 group-data-focus:text-gray-700 dark:group-data-focus:text-gray-50">
                    {_prop.entity.description}
                  </p>
                </div>

                <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-focus:text-white group-data-selected:flex">
                  <CheckIcon className="size-5" aria-hidden="true" />
                </span>
              </ComboboxOption>
            ))}
            {EffectString.isNonEmpty(propsFilter) ? (
              <ComboboxOption
                key="user_entered"
                value={propsFilter}
                className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 dark:text-white select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden border-t border-gray-300 dark:border-white/10"
              >
                <span className="flex items-center gap-x-1.5 truncate group-data-selected:font-semibold">
                  New Property: <InlineCode>{propsFilter}</InlineCode>
                </span>
              </ComboboxOption>
            ) : null}
          </ComboboxOptions>
        ) : null}
      </div>
      {hasErrors ? <ErrorMessages id={`${id}-invalid`} errors={errors} /> : null}
    </Combobox>
  );
}
