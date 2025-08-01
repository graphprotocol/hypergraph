'use client';

import { Checkbox as HeadlessCheckbox, type CheckboxProps as HeadlessCheckboxProps } from '@headlessui/react';
import { CheckIcon } from '@phosphor-icons/react';

import { useFieldContext } from './form.ts';

export type CheckboxProps = Omit<HeadlessCheckboxProps, 'id' | 'name'> & {
  id: string;
  name: string;
  label: React.ReactNode;
};
export function Checkbox({ id, name, label, ...rest }: Readonly<CheckboxProps>) {
  const field = useFieldContext<boolean | null | undefined>();

  return (
    <fieldset>
      <legend className="sr-only">{name}</legend>
      <div className="flex gap-3">
        <div className="flex h-6 shrink-0 items-center">
          <div className="group grid size-4 grid-cols-1">
            <HeadlessCheckbox
              {...rest}
              id={id}
              name={name}
              checked={field.state.value || false}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
              className="group col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 data-[checked]:border-indigo-600 checked:bg-indigo-600 data-[checked]:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
            >
              <CheckIcon
                className="group-data-checked:opacity-100 stroke-white text-white opacity-0"
                aria-hidden="true"
              />
            </HeadlessCheckbox>
          </div>
        </div>
        <div className="text-sm/6">
          <label htmlFor={name || id} className="font-medium text-gray-900 dark:text-white">
            {label}
          </label>
        </div>
      </div>
    </fieldset>
  );
}
