'use client';

import { Disclosure, DisclosureButton, DisclosurePanel, Input } from '@headlessui/react';
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/20/solid';
import { Array as EffectArray, pipe } from 'effect';
import { useState } from 'react';

import { type SchemaBrowserType, useSchemaBrowserQuery } from '../../../../hooks/useSchemaBrowserQuery.js';
import { InlineCode } from '../../../InlineCode.js';
import { Loading } from '../../../Loading.js';

export type SchemaBrowserProps = Readonly<{
  typeSelected(type: SchemaBrowserType): void;
}>;
export function SchemaBrowser({ typeSelected }: SchemaBrowserProps) {
  const [typeSearch, setTypeSearch] = useState('');

  const { data: types, isLoading } = useSchemaBrowserQuery({
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    select(data) {
      if (!typeSearch) {
        return data;
      }
      return pipe(
        data,
        EffectArray.filter((type) => type.slug.includes(typeSearch.toLowerCase())),
      );
    },
  });

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
          <Input
            id="SchemaBrowserSearch"
            name="SchemaBrowserSearch"
            value={typeSearch}
            onChange={(e) => setTypeSearch(e.target.value || '')}
            type="search"
            placeholder="Search types..."
            className="block min-w-0 grow py-1.5 pl-2 pr-3 rounded-md bg-white dark:bg-slate-700 data-[state=invalid]:pr-10 text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline sm:text-sm/6 focus-visible:outline-none w-full"
          />
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
                    className="min-w-0 data-[interactive=clickable]:cursor-pointer"
                  >
                    <div className="flex items-center gap-x-2">
                      <ChevronDownIcon className="size-4" aria-hidden="true" />
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
                  className="w-full transition duration-200 ease-in-out py-1.5 flex flex-col gap-y-1"
                >
                  <ul className="w-full pl-6 pr-3 divide-y divide-gray-300 dark:divide-gray-800">
                    {properties.map((prop) => (
                      <li key={prop.id} className="w-full text-xs py-1.5 flex items-center gap-x-2 list-disc">
                        {prop.entity?.name || prop.id}
                        {prop.dataType != null ? <InlineCode>{prop.dataType}</InlineCode> : null}
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
