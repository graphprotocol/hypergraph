'use client';

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { CaretDownIcon, CaretRightIcon, PlusIcon } from '@phosphor-icons/react';
import { createFormHook } from '@tanstack/react-form';
import { Array as EffectArray, String as EffectString } from 'effect';
import { useState } from 'react';

import { fieldContext, formContext } from '@/Components/Form/form.ts';
import { TextField } from '@/Components/Form/TextField.tsx';
import { type ExtendedSchemaBrowserType, useSchemaBrowserQuery } from '@/hooks/useKnowledgeGraph.tsx';
import { mapKGDataTypeToPrimitiveType } from '@/utils/type-mapper.ts';
import { InlineCode } from '../InlineCode.tsx';
import { Loading } from '../Loading.tsx';

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

export type KnowledgeGraphBrowserProps = Readonly<{
  typeSelected(type: ExtendedSchemaBrowserType): void;
}>;
export function KnowledgeGraphBrowser({ typeSelected }: KnowledgeGraphBrowserProps) {
  const [typeSearch, setTypeSearch] = useState('');
  const schemaBrowserForm = useAppForm({
    defaultValues: {
      search: '',
    } as {
      search: string;
    },
    asyncDebounceMs: 300,
  });

  const { data: types, isLoading } = useSchemaBrowserQuery(
    {
      query: EffectString.isNonEmpty(typeSearch) ? EffectString.toLowerCase(typeSearch) : null,
      first: 100,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  return (
    <div className="flex flex-col gap-y-6">
      <div className="border-b border-gray-200 dark:border-white/20 pb-5 h-20">
        <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white flex items-center gap-x-3">
          Schema Browser
          {isLoading ? <Loading /> : null}
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-200">
          Browse existing schemas/types from the Knowledge Graph to add to your schema.
        </p>
      </div>
      <div className="bg-gray-100 dark:bg-slate-900 rounded-lg flex flex-col gap-y-3 pt-2">
        <div className="px-3 mt-2">
          <schemaBrowserForm.AppField
            name="search"
            listeners={{
              // wait 300ms before setting the TypeSearch state value.
              // an update on that value will update the useSchemaBrowserQuery vars, sending a search query to the Knowledge Graph
              onChangeDebounceMs: 300,
              onChange({ value }) {
                setTypeSearch(value);
              },
            }}
          >
            {(field) => (
              <field.TextField id="search" name="search" type="search" placeholder="Search Knowledge Graph types..." />
            )}
          </schemaBrowserForm.AppField>
        </div>
        <ul className="px-4 divide-y divide-gray-100 dark:divide-gray-700 overflow-y-auto h-[500px] 2xl:h-[850px]">
          {(types ?? []).map((_type) => {
            const properties = EffectArray.filter(_type.properties ?? [], (prop) => prop != null);

            return (
              <Disclosure as="li" key={_type.id} className="py-3 flex flex-col gap-y-2">
                <div className="flex items-center justify-between gap-x-6">
                  <DisclosureButton
                    as="div"
                    data-interactive="clickable"
                    className="min-w-0 data-[interactive=clickable]:cursor-pointer group"
                  >
                    <div className="flex items-center gap-x-2">
                      {/* shown when the collapsible is open */}
                      <CaretDownIcon className="size-4 hidden group-data-open:flex" aria-hidden="true" />
                      {/* shown when the collapsible is closed */}
                      <CaretRightIcon className="size-4 flex group-data-open:hidden" aria-hidden="true" />
                      <p className="text-sm/6 font-semibold text-gray-900 dark:text-white">{_type.name || _type.id}</p>
                      <InlineCode>{_type.id}</InlineCode>
                    </div>
                  </DisclosureButton>
                  <div className="flex flex-none items-center justify-end">
                    <button
                      type="button"
                      className="rounded-md bg-white dark:bg-black p-2 cursor-pointer text-sm font-semibold text-gray-900 dark:text-white shadow-xs ring-1 ring-gray-300 dark:ring-black/15 ring-inset hover:bg-gray-50 dark:hover:bg-slate-950 inline-flex flex-col items-center justify-center"
                      onClick={() => typeSelected(_type)}
                    >
                      <PlusIcon
                        className="size-5 text-gray-400 dark:text-gray-200 group-data-focus:text-gray-500 dark:group-data-focus:text-gray-200"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
                <DisclosurePanel
                  as="div"
                  transition
                  className="w-full origin-top transition duration-200 ease-out data-closed:-translate-y-6 data-closed:opacity-0 py-1.5 flex flex-col gap-y-1"
                >
                  <ul className="w-full pl-6 pr-3 divide-y divide-gray-300 dark:divide-gray-800">
                    {properties.map((prop) => (
                      <li key={prop.id} className="w-full text-xs py-1.5 flex items-center gap-x-2 list-disc">
                        {prop.name || prop.id}
                        {prop.dataType != null ? (
                          <InlineCode>{mapKGDataTypeToPrimitiveType(prop.dataType, prop.name || prop.id)}</InlineCode>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </DisclosurePanel>
              </Disclosure>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
