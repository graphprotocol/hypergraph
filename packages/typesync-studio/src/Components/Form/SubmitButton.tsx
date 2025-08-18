'use client';

import { Tooltip } from '@base-ui-components/react/tooltip';
import { CheckIcon, ExclamationMarkIcon } from '@phosphor-icons/react';

import { classnames } from '@/utils/classnames.ts';
import { Arrow } from '../Arrow.tsx';
import { Loading } from '../Loading.tsx';
import { useFormContext } from './form.ts';

export function SubmitButton({
  status,
  tooltip,
  children,
}: Readonly<{
  status: 'idle' | 'error' | 'success' | 'submitting';
  /**
   * If provided, then render a rooltip around the button with additional details
   */
  tooltip?:
    | {
        disabled?: boolean | undefined;
        content: React.ReactNode;
      }
    | null
    | undefined;
  children: React.ReactNode;
}>) {
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
      {({ canSubmit, isSubmitting, valid, dirty }) => {
        if (tooltip) {
          return (
            <Tooltip.Provider delay={300} closeDelay={1_000}>
              <Tooltip.Root disabled={tooltip.disabled || false}>
                <Tooltip.Trigger
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
                      <ExclamationMarkIcon className="size-5 text-white" aria-hidden="true" />
                      Error
                    </>
                  ) : (
                    children
                  )}
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Positioner side="top" sideOffset={10}>
                    <Tooltip.Popup className="box-border text-sm flex flex-col px-2 py-3 rounded-lg bg-gray-100 dark:bg-slate-900 transform-content data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 w-fit max-w-xs">
                      <Tooltip.Arrow className="flex data-[side=top]:-bottom-2 data-[side=top]:rotate-180 data-[side=bottom]:-top-2 data-[side=bottom]:rotate-0 data-[side=left]:-right-3 data-[side=left]:rotate-90 data-[side=right]:-left-3 data-[side=right]:-rotate-90">
                        <Arrow />
                      </Tooltip.Arrow>
                      <span className="text-xs text-gray-700 dark:text-white whitespace-break-spaces w-full">
                        {tooltip.content}
                      </span>
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          );
        }

        return (
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
                <ExclamationMarkIcon className="size-5 text-white" aria-hidden="true" />
                Error
              </>
            ) : (
              children
            )}
          </button>
        );
      }}
    </form.Subscribe>
  );
}
