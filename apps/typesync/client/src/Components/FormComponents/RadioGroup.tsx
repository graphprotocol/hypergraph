import { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from '@headlessui/react';

import { useFieldContext } from '../../context/form.js';

export type FormComponentRadioGroupProps = Omit<RadioGroupProps, 'id'> & {
  id: string;
  label: React.ReactNode;
  options: ReadonlyArray<RadioProps>;
};
export function FormComponentRadioGroup({ id, label, options, ...rest }: Readonly<FormComponentRadioGroupProps>) {
  const field = useFieldContext<string>();

  return (
    <fieldset>
      <legend className="text-sm/6 font-semibold text-gray-900 dark:text-white">{label}</legend>
      <RadioGroup
        id={id}
        {...rest}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(value) => field.handleChange(value)}
        className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-x-4"
      >
        {options.map((opt, idx) => {
          const radioOptKey = `RadioGroup__Opt[${opt.id || idx}]`;
          return (
            <Radio
              key={radioOptKey}
              {...opt}
              className="group relative flex cursor-pointer rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-700 p-4 shadow-xs focus:outline-hidden data-focus:border-indigo-600 dark:data-focus:border-indigo-500 data-focus:ring-2 data-focus:ring-indigo-600 dark:data-focus:ring-indigo-500"
            />
          );
        })}
      </RadioGroup>
    </fieldset>
  );
}
