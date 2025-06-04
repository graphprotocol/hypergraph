import { Textarea, type TextareaProps } from '@headlessui/react';
import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '../../context/form.js';
import { ErrorMessages } from './ErrorMessages.js';

export type FormComponentTextAreaProps = Omit<TextareaProps, 'id'> & {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
};
export function FormComponentTextArea({ id, label, hint, ...rest }: Readonly<FormComponentTextAreaProps>) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);
  const hasErrors = errors.length > 0;

  return (
    <div>
      <label htmlFor={rest.name} className="block text-sm/6 font-medium text-gray-900 dark:text-white">
        {label}
        {rest.required ? '*' : ''}
      </label>
      <div className="mt-2">
        <Textarea
          {...rest}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          data-state={hasErrors ? 'invalid' : undefined}
          aria-invalid={hasErrors ? 'true' : undefined}
          aria-describedby={hasErrors ? `${id}-invalid` : hint != null ? `${id}-hint` : undefined}
          rows={rest.rows || 3}
          className="block w-full rounded-md bg-white dark:bg-white/5 px-3 py-1.5 text-base text-gray-900 dark:text-white outline -outline-offset-1 outline-gray-300 dark:outline-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:focus:outline-indigo-500 sm:text-sm/6"
        />
      </div>
      {hasErrors ? <ErrorMessages id={`${id}-invalid`} errors={errors} /> : null}
      {hint != null && !hasErrors ? (
        <p id={`${id}-hint`} className="mt-3 text-sm/6 text-gray-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
