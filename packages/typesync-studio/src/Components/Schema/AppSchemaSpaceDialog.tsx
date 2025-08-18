'use client';

import { Id, type SpaceStorageEntry } from '@graphprotocol/hypergraph';
import { useHypergraphApp, useHypergraphAuth, useSpaces } from '@graphprotocol/hypergraph-react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { WarningIcon, XIcon } from '@phosphor-icons/react';
import { createFormHook, useStore } from '@tanstack/react-form';
import { Schema } from 'effect';

import { fieldContext, formContext, useFieldContext } from '@/Components/Form/form.ts';
import { SubmitButton } from '@/Components/Form/SubmitButton.tsx';
import { useAppSchemaSpace } from '@/Context/AppSchemaSpaceContext';
import { ErrorMessages } from '../Form/ErrorMessages';
import { InlineCode } from '../InlineCode';

const SelectAppSchemaSpaceFormSchema = Schema.Struct({
  spaceId: Schema.String,
  name: Schema.String,
});
type SelectAppSchemaSpaceFormSchema = typeof SelectAppSchemaSpaceFormSchema.Type;

const { useAppForm } = createFormHook({
  fieldComponents: {
    SchemaSpaceSelect,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});

export function AppSchemaSpaceDialog({
  open,
  setOpen,
  spaceSubmitted,
}: Readonly<{
  open: boolean;
  setOpen(open: boolean): void;
  /**
   * Use this option if the user has selected a space to publish to and submitted the form
   * @param args the selected space data
   */
  spaceSubmitted(args: Readonly<{ id: Id; name: string | null }>): void;
}>) {
  const { setAppSchemaSpace } = useAppSchemaSpace();

  const defaultValues: SelectAppSchemaSpaceFormSchema = {
    spaceId: '',
    name: '',
  };
  const selectAppSchemaSpaceForm = useAppForm({
    defaultValues,
    validators: {
      onChange: Schema.standardSchemaV1(SelectAppSchemaSpaceFormSchema),
    },
    onSubmit({ value }) {
      const space = {
        id: Id(value.spaceId),
        name: value.name,
      };
      setAppSchemaSpace(space);
      spaceSubmitted(space);
    },
  });
  const selectedSpace = useStore(selectAppSchemaSpaceForm.store, (state) => state.values.name);

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-gray-900/50"
      />

      <form
        noValidate
        className="fixed inset-0 z-10 w-screen overflow-y-auto"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void selectAppSchemaSpaceForm.handleSubmit();
        }}
      >
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95 dark:bg-gray-800 dark:outline dark:-outline-offset-1 dark:outline-white/10"
          >
            <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 dark:bg-gray-800 dark:hover:text-gray-300 dark:focus:outline-white"
              >
                <span className="sr-only">Close</span>
                <XIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:size-10 dark:bg-yellow-500/10">
                <WarningIcon aria-hidden="true" className="size-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900 dark:text-white">
                  Select Space
                </DialogTitle>
                <div className="mt-2 flex flex-col gap-y-4 w-full">
                  <selectAppSchemaSpaceForm.AppField name="spaceId">
                    {(field) => (
                      <field.SchemaSpaceSelect
                        id="spaceId"
                        name="spaceId"
                        spaceSelected={(space) => {
                          selectAppSchemaSpaceForm.setFieldValue('name', space.name || space.id);
                          selectAppSchemaSpaceForm.setFieldValue('spaceId', space.id);
                        }}
                      />
                    )}
                  </selectAppSchemaSpaceForm.AppField>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-x-2">
              <selectAppSchemaSpaceForm.AppForm>
                <selectAppSchemaSpaceForm.SubmitButton status={'idle'}>
                  Select Space <InlineCode>{selectedSpace}</InlineCode> &amp; Publish
                </selectAppSchemaSpaceForm.SubmitButton>
              </selectAppSchemaSpaceForm.AppForm>
              <button
                type="button"
                onClick={() => {
                  selectAppSchemaSpaceForm.reset(undefined, { keepDefaultValues: true });
                  setOpen(false);
                }}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </form>
    </Dialog>
  );
}

type SchemaSpaceSelectProps = {
  id: string;
  name: string;
  spaceSelected(
    space:
      | SpaceStorageEntry
      | {
          id: string;
          name: string | undefined;
          spaceAddress: string;
        },
  ): void;
};
function SchemaSpaceSelect({ id, name, spaceSelected }: Readonly<SchemaSpaceSelectProps>) {
  const { redirectToConnect } = useHypergraphApp();
  const { authenticated } = useHypergraphAuth();
  const { data: publicSpaces = [], isPending } = useSpaces({ mode: 'public' });

  const field = useFieldContext<string>();
  const value = useStore(field.store, (state) => state.value);
  const errors = useStore(field.store, (state) => state.meta.errors);
  const touched = useStore(field.store, (state) => state.meta.isTouched);
  const hasErrors = errors.length > 0 && touched;

  if (!authenticated) {
    return (
      <button
        type="button"
        className="rounded-full bg-slate-900 flex items-center justify-center px-3 py-1.5 text-sm font-semibold text-white shadow-xs ring-1 ring-white/10 ring-inset hover:bg-white/10 cursor-pointer w-full"
        onClick={() =>
          redirectToConnect({
            storage: localStorage,
            connectUrl: 'https://connect.geobrowser.io/',
            successUrl: `${window.location.origin}/authenticate-callback`,
            redirectFn(url: URL) {
              window.location.href = url.toString();
            },
          })
        }
      >
        Sign in to Geo Account
      </button>
    );
  }
  if (!isPending && publicSpaces.length === 0) {
    return (
      <div className="w-full flex flex-col gap-y-2">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Schemas need to be published to a public Space you have granted access to this app
        </p>
        <p className="text-xs text-gray-700 dark:text-gray-300">Reconnect to Geo connect and connect public spaces</p>
        <button
          type="button"
          className="rounded-full bg-slate-900 flex items-center justify-center px-3 py-1.5 text-sm font-semibold text-white shadow-xs ring-1 ring-white/10 ring-inset hover:bg-white/10 cursor-pointer w-full"
          onClick={() =>
            redirectToConnect({
              storage: localStorage,
              connectUrl: 'https://connect.geobrowser.io/',
              successUrl: `${window.location.origin}/authenticate-callback`,
              redirectFn(url: URL) {
                window.location.href = url.toString();
              },
            })
          }
        >
          Connect Spaces
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-y-2 w-full">
      <fieldset
        id={id}
        name={name}
        aria-label="App Schema Space"
        onBlur={field.handleBlur}
        className="relative -space-y-px rounded-md bg-white dark:bg-gray-800/50 w-full flex flex-col gap-y-2"
      >
        <legend className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
          Select the Space to publish your Hypergraph shema to.
        </legend>
        {publicSpaces.map((publicSpace) => (
          <label
            key={publicSpace.id}
            aria-label={publicSpace.name || publicSpace.id}
            aria-description={`space-${publicSpace.id}`}
            className="group flex border border-gray-200 p-4 first:rounded-tl-md first:rounded-tr-md last:rounded-br-md last:rounded-bl-md focus:outline-hidden has-checked:relative has-checked:border-indigo-200 has-checked:bg-indigo-50 dark:border-gray-700 dark:has-checked:border-indigo-800 dark:has-checked:bg-indigo-500/10 w-full cursor-pointer"
          >
            <input
              value={publicSpace.id}
              checked={publicSpace.id === value}
              onChange={(e) => {
                const checked = e.target.checked;
                if (checked) {
                  field.handleChange(publicSpace.id);
                  spaceSelected(publicSpace);
                }
              }}
              name={name}
              type="radio"
              className="relative mt-0.5 size-4 shrink-0 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/10 dark:bg-white/5 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/5 dark:disabled:bg-white/10 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
            />
            <span className="ml-3 flex flex-col gap-y-1">
              <span className="flex items-center gap-x-2 text-sm font-medium text-gray-900 group-has-checked:text-indigo-900 dark:text-white dark:group-has-checked:text-indigo-300">
                {publicSpace.name || publicSpace.id}
              </span>
              <span className="block text-sm text-gray-500 group-has-checked:text-indigo-700 dark:text-gray-400 dark:group-has-checked:text-indigo-300/75">
                {publicSpace.name != null ? <InlineCode>{publicSpace.id}</InlineCode> : null}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      {hasErrors ? <ErrorMessages id={`${id}-invalid`} errors={errors} /> : null}
    </div>
  );
}
