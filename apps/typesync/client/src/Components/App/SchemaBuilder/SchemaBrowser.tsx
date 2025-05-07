'use client';

import { Disclosure, DisclosureButton, DisclosurePanel, Input } from '@headlessui/react';
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/20/solid';
import { useQuery } from '@tanstack/react-query';
import { Array as EffectArray, Order, pipe } from 'effect';
import { useState } from 'react';

import type { SchemaBrowserTypesQuery } from '../../../generated/graphql';
import { schemaBrowserQueryOptions } from '../../../hooks/useSchemaBrowserQuery';
import { Loading } from '../../Loading';

export type SchemaBrowserType = NonNullable<SchemaBrowserTypesQuery['space']>['types'][number];
type ExtendedSchemaBrowserType = SchemaBrowserType & { slug: string };

const SchemaTypeOrder = Order.mapInput(Order.string, (type: SchemaBrowserType) => type.name || type.id);

export type SchemaBrowserProps = Readonly<{
  typeSelected(type: SchemaBrowserType): void;
}>;
export function SchemaBrowser(props: SchemaBrowserProps) {
  const [typeSearch, setTypeSearch] = useState('');

  const { data: types, isLoading } = useQuery({
    ...schemaBrowserQueryOptions,
    select(data) {
      const types = data.space?.types ?? [];
      const mappedAndSorted = pipe(
        types,
        EffectArray.map((type) => {
          const slugifiedProps = EffectArray.reduce(type.properties, '', (slug, curr) => `${slug}${curr.name || ''}`);
          const slug = `${type.name || ''}${slugifiedProps}`.toLowerCase();
          return {
            ...type,
            slug,
          } as const satisfies ExtendedSchemaBrowserType;
        }),
        EffectArray.sort(SchemaTypeOrder),
      );
      if (!typeSearch) {
        return mappedAndSorted;
      }
      return pipe(
        mappedAndSorted,
        EffectArray.filter((type) => type.slug.includes(typeSearch.toLowerCase())),
      );
    },
  });

  return (
    <div className="flex flex-col gap-y-6">
      <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white flex items-center gap-x-3">
        Schema Browser
        {isLoading ? <Loading /> : null}
      </h3>
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
        <ul className="px-4 divide-y divide-gray-100 dark:divide-gray-700 overflow-y-auto h-fit max-h-[500px] 2xl:max-h-[750px]">
          {(types ?? []).map((_type) => (
            <Disclosure as="li" key={_type.id} className="py-3 flex flex-col gap-y-2">
              <div className="flex items-center justify-between gap-x-6">
                <DisclosureButton
                  as="div"
                  disabled={_type.properties.length === 0}
                  data-interactive={_type.properties.length > 0 ? 'clickable' : undefined}
                  className="min-w-0 data-[interactive=clickable]:cursor-pointer"
                >
                  <div className="flex items-center gap-x-2">
                    {_type.properties.length > 0 ? <ChevronDownIcon className="size-4" aria-hidden="true" /> : null}
                    <p className="text-sm/6 font-semibold text-gray-900 dark:text-white">{_type.name || _type.id}</p>
                    <p className="text-xs font-light text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-600 ring-gray-500/10 rounded-md px-1.5 py-0.5 whitespace-nowrap ring-1 ring-inset">
                      {_type.id}
                    </p>
                  </div>
                </DisclosureButton>
                <div className="flex flex-none items-center justify-end">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-black p-2 cursor-pointer text-sm font-semibold text-gray-900 dark:text-white shadow-xs ring-1 ring-gray-300 dark:ring-black/15 ring-inset hover:bg-gray-50 dark:hover:bg-slate-950 inline-flex flex-col items-center justify-center"
                    onClick={() => props.typeSelected(_type)}
                  >
                    <PlusIcon className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <DisclosurePanel
                as="div"
                transition
                className="w-full transition duration-200 ease-in-out py-1.5 flex flex-col gap-y-1"
              >
                <ul className="w-full pl-6 pr-3 divide-y divide-gray-300 dark:divide-gray-800">
                  {_type.properties.map((prop) => (
                    <li key={prop.id} className="w-full text-xs py-1.5 flex items-center gap-x-2 list-disc">
                      {prop.name || prop.id}
                      {prop.valueType?.name != null ? (
                        <p className="text-xs font-light text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700 ring-gray-500/10 dark:ring-gray-700/10 rounded-md px-1.5 py-0.5 whitespace-nowrap ring-1 ring-inset">
                          {prop.valueType.name}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </DisclosurePanel>
            </Disclosure>
          ))}
        </ul>
      </div>
    </div>
  );
}
