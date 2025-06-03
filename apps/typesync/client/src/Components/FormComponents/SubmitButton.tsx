import { CheckIcon, ExclamationCircleIcon } from '@heroicons/react/16/solid';

import { useFormContext } from '../../context/form.js';
import { classnames } from '../../utils/classnames.js';
import { Loading } from '../Loading.js';

export function SubmitButton({
  status,
  children,
}: Readonly<{ status: 'idle' | 'error' | 'success' | 'submitting'; children: React.ReactNode }>) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({
        canSubmit: state.canSubmit,
        isSubmitting: state.isSubmitting,
        valid: state.isValid && state.errors.length === 0,
        dirty: state.isDirty,
      })}
    >
      {({ canSubmit, isSubmitting, valid, dirty }) => (
        <button
          type="submit"
          disabled={!canSubmit || !valid || !dirty || isSubmitting}
          data-state={status}
          className={classnames(
            'rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500 inline-flex items-center gap-x-2 cursor-pointer',
            'disabled:bg-gray-400 disabled:text-gray-900 disabled:hover:bg-gray-400 disabled:focus-visible:outline-gray-400 disabled:cursor-not-allowed',
            'data-[state=error]:bg-red-600 data-[state=error]:hover:bg-red-500 data-[state=error]:focus-visible:bg-red-500 data-[state=success]:focus-visible:bg-green-500',
            'data-[state=success]:bg-green-600 data-[state=success]:hover:bg-green-500',
          )}
        >
          {status === 'submitting' ? (
            <Loading />
          ) : status === 'success' ? (
            <>
              <CheckIcon className="size-5 text-white" aria-hidden="true" />
              {children}
            </>
          ) : status === 'error' ? (
            <>
              <ExclamationCircleIcon className="size-5 text-white" aria-hidden="true" />
              Error
            </>
          ) : (
            children
          )}
        </button>
      )}
    </form.Subscribe>
  );
}
