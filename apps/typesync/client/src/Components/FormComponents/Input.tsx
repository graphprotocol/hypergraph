import { Input, type InputProps } from '@headlessui/react';
import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '../../context/form.js';
import { classnames } from '../../utils/classnames.js';
import { ErrorMessages } from './ErrorMessages.js';

export type FormComponentInputProps = Omit<InputProps, 'id'> & {
  id: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
};
export function FormComponentTextField({ id, label, hint, ...rest }: Readonly<FormComponentInputProps>) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);
  const touched = useStore(field.store, (state) => state.meta.isTouched);
  const hasErrors = errors.length > 0 && touched;

  return (
    <div>
      {label != null ? (
        <label htmlFor={rest.name} className="block text-sm/6 font-medium text-gray-900 dark:text-white">
          {label}
          {rest.required ? '*' : ''}
        </label>
      ) : null}
      <div className={classnames('grid grid-cols-1', label != null ? 'mt-2' : 'mt-0')}>
        <div
          data-state={hasErrors ? 'invalid' : undefined}
          className="col-start-1 row-start-1 flex items-center rounded-md bg-white dark:bg-white/5 pl-3 outline -outline-offset-1 outline-gray-300 dark:outline-white/10 data-[state=invalid]:outline-red-300 dark:data-[state=invalid]:outline-red-600 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 dark:focus-within:outline-indigo-500 data-[state=invalid]:focus-within:outline-red-600 dark:data-[state=invalid]:focus-within:outline-red-400"
        >
          <Input
            {...rest}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            data-state={hasErrors ? 'invalid' : undefined}
            aria-invalid={hasErrors ? 'true' : undefined}
            aria-describedby={hasErrors ? `${id}-invalid` : hint != null ? `${id}-hint` : undefined}
            className="block min-w-0 grow py-1.5 pl-1 pr-3 data-[state=invalid]:pr-10 text-base text-gray-900 dark:text-white data-[state=invalid]:text-red-900 dark:data-[state=invalid]:text-red-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 data-[state=invalid]:placeholder:text-red-700 dark:data-[state=invalid]:placeholder:text-red-400 focus:outline sm:text-sm/6 focus-visible:outline-none"
          />
        </div>
        {hasErrors ? <ErrorMessages id={`${id}-invalid`} errors={errors} /> : null}
        {hint != null && !hasErrors ? (
          <p id={`${id}-hint`} className="mt-3 text-sm/6 text-gray-400">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
