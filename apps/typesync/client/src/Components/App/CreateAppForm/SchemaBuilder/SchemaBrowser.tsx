'use client';

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import { ChevronDownIcon, EllipsisVerticalIcon, PlusIcon } from '@heroicons/react/20/solid';
import { useQuery } from '@tanstack/react-query';
import { Array as EffectArray, Order, pipe } from 'effect';
import { useState } from 'react';

import type { SchemaBrowserTypesQuery } from '../../../../generated/graphql';
import { schemaBrowserQueryOptions } from '../../../../hooks/useSchemaBrowserQuery';
import { Loading } from '../../../Loading';

export type SchemaBrowserType = NonNullable<SchemaBrowserTypesQuery['types'][number]>;
type ExtendedSchemaBrowserType = SchemaBrowserType & { slug: string };

export type AddSchemaBrowserTypeOp = Readonly<{
  type: SchemaBrowserType;
  op: { type: 'ADD_AS_TYPE' } | { type: 'ADD_AS_PROP'; schemaType: string; schemaTypeIdx: number };
}>;

const SchemaTypeOrder = Order.mapInput(Order.string, (type: SchemaBrowserType) => type.name || type.id);

export type SchemaBrowserProps = Readonly<{
  schemaTypes?: Array<{ type: string; schemaTypeIdx: number }>;
  typeSelected(type: AddSchemaBrowserTypeOp): void;
}>;
export function SchemaBrowser({ schemaTypes = [], typeSelected }: SchemaBrowserProps) {
  const [typeSearch, setTypeSearch] = useState('');

  const { data: types, isLoading } = useQuery({
    ...schemaBrowserQueryOptions,
    select(data) {
      const types = data.types ?? [];
      const mappedAndSorted = pipe(
        types,
        EffectArray.filter((type) => type?.name != null && type?.properties != null && type.properties.length > 0),
        EffectArray.filter((type) => type != null),
        EffectArray.map((type) => {
          const slugifiedProps = pipe(
            type.properties ?? [],
            EffectArray.filter((prop) => prop != null),
            EffectArray.reduce('', (slug, curr) => `${slug}${curr.entity?.name || ''}`),
          );
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
            const hasProperties = properties.length > 0;
            return (
              <Disclosure as="li" key={_type.id} className="py-3 flex flex-col gap-y-2">
                <div className="flex items-center justify-between gap-x-6">
                  <DisclosureButton
                    as="div"
                    disabled={!hasProperties}
                    data-interactive={hasProperties ? 'clickable' : undefined}
                    className="min-w-0 data-[interactive=clickable]:cursor-pointer"
                  >
                    <div className="flex items-center gap-x-2">
                      {hasProperties ? <ChevronDownIcon className="size-4" aria-hidden="true" /> : null}
                      <p className="text-sm/6 font-semibold text-gray-900 dark:text-white">{_type.name || _type.id}</p>
                      <InlineCode>{_type.id}</InlineCode>
                    </div>
                  </DisclosureButton>
                  <div className="flex flex-none items-center justify-end">
                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        <MenuButton className="rounded-md bg-white dark:bg-black p-2 cursor-pointer text-sm font-semibold text-gray-900 dark:text-white shadow-xs ring-1 ring-gray-300 dark:ring-black/15 ring-inset hover:bg-gray-50 dark:hover:bg-slate-950 inline-flex flex-col items-center justify-center">
                          <span className="sr-only">Open schema option</span>
                          <EllipsisVerticalIcon className="size-4" aria-hidden="true" />
                        </MenuButton>
                      </div>

                      <MenuItems
                        transition
                        className="absolute right-0 z-10 mt-2 w-80 origin-top-right divide-y divide-gray-100 dark:divide-white/10 rounded-md bg-white dark:bg-black shadow-lg ring-1 ring-black/5 dark:ring-black/10 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                      >
                        <div className="w-full py-2 px-1">
                          <MenuItem key="add_as_type">
                            <button
                              type="button"
                              className="w-full group rounded-md flex items-center gap-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-100 data-focus:bg-gray-100 dark:data-focus:bg-slate-800 data-focus:text-gray-900 dark:data-focus:text-gray-50 data-focus:outline-hidden cursor-pointer"
                              onClick={() => typeSelected({ type: _type, op: { type: 'ADD_AS_TYPE' } })}
                            >
                              <PlusIcon
                                className="mr-3 size-5 text-gray-400 dark:text-gray-200 group-data-focus:text-gray-500 dark:group-data-focus:text-gray-200"
                                aria-hidden="true"
                              />
                              <span>
                                Add <InlineCode>{_type.name || _type.id}</InlineCode> to schema
                              </span>
                            </button>
                          </MenuItem>
                        </div>
                        {schemaTypes.length > 0 ? (
                          <div className="w-full py-2 px-1">
                            {schemaTypes.map((schemaType) => (
                              <MenuItem key={`add_to_schema_type__${schemaType.type}`}>
                                <button
                                  type="button"
                                  className="w-full group rounded-md flex items-center gap-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-100 data-focus:bg-gray-100 dark:data-focus:bg-slate-800 data-focus:text-gray-900 dark:data-focus:text-gray-50 data-focus:outline-hidden cursor-pointer"
                                  onClick={() =>
                                    typeSelected({
                                      type: _type,
                                      op: {
                                        type: 'ADD_AS_PROP',
                                        schemaType: schemaType.type,
                                        schemaTypeIdx: schemaType.schemaTypeIdx,
                                      },
                                    })
                                  }
                                >
                                  <PlusIcon
                                    className="mr-3 size-5 text-gray-400 dark:text-gray-200 group-data-focus:text-gray-500 dark:group-data-focus:text-gray-200"
                                    aria-hidden="true"
                                  />
                                  <span>
                                    Add as property to: <InlineCode>{schemaType.type}</InlineCode>
                                  </span>
                                </button>
                              </MenuItem>
                            ))}
                          </div>
                        ) : null}
                      </MenuItems>
                    </Menu>
                  </div>
                </div>
                <DisclosurePanel
                  as="div"
                  transition
                  className="w-full transition duration-200 ease-in-out py-1.5 flex flex-col gap-y-1"
                >
                  <ul className="w-full pl-6 pr-3 divide-y divide-gray-300 dark:divide-gray-800">
                    {EffectArray.filter(properties, (prop) => prop.dataType != null && prop.entity?.name != null).map(
                      (prop) => (
                        <li key={prop.id} className="w-full text-xs py-1.5 flex items-center gap-x-2 list-disc">
                          {prop.entity?.name || prop.id}
                          {prop.dataType != null ? <InlineCode>{prop.dataType}</InlineCode> : null}
                        </li>
                      ),
                    )}
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

function InlineCode({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <span className="text-xs inline font-light text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-600 ring-gray-500/10 rounded-md px-1.5 py-0.5 whitespace-nowrap ring-1 ring-inset">
      {children}
    </span>
  );
}
