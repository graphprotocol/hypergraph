'use client';

import { Tooltip } from '@base-ui-components/react/tooltip';
import type { TypesyncHypergraphSchemaStatus } from '@graphprotocol/hypergraph/typesync';
import { LockIcon, LockKeyIcon, LockOpenIcon } from '@phosphor-icons/react';

export function SchemaPropertyStatus({ status }: Readonly<{ status: TypesyncHypergraphSchemaStatus }>) {
  const content = StatusTooltipContentMap[status || 'local'];

  return (
    <Tooltip.Provider delay={500} closeDelay={500}>
      <Tooltip.Root>
        <Tooltip.Trigger aria-label={status || undefined}>
          <CorrectIcon status={status} />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner side="top" sideOffset={10}>
            <Tooltip.Popup className="box-border text-sm flex flex-col px-2 py-3 rounded-lg bg-gray-100 dark:bg-slate-900 transform-content data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 w-fit max-w-xs">
              <Tooltip.Arrow className="flex data-[side=top]:-bottom-2 data-[side=top]:rotate-180 data-[side=bottom]:-top-2 data-[side=bottom]:rotate-0 data-[side=left]:-right-3 data-[side=left]:rotate-90 data-[side=right]:-left-3 data-[side=right]:-rotate-90">
                <ArrowSvg />
              </Tooltip.Arrow>
              <span className="text-xs text-gray-700 dark:text-white whitespace-break-spaces w-full">{content}</span>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

function CorrectIcon({ status }: Readonly<{ status: TypesyncHypergraphSchemaStatus }>) {
  if (status === 'published') {
    // type/property is published to the Knowledge Graph
    return <LockKeyIcon className="size-4 text-inherit" aria-hidden="true" />;
  }
  if (status === 'synced') {
    // type/property is synced with the schema.ts file, but needs published to the Knowledge Graph
    return <LockIcon className="size-4 text-inherit" aria-hidden="true" />;
  }
  // type/property is new/created in the UI. needs to be synced to the file/KG
  return <LockOpenIcon className="size-4 text-inherit" aria-hidden="true" />;
}

function ArrowSvg(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <title>Tooltip positioner arrow</title>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className="fill-gray-100 dark:fill-slate-900"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className="fill-gray-200 dark:fill-slate-900"
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className="fill-gray-300 dark:fill-slate-900"
      />
    </svg>
  );
}

const StatusTooltipContentMap = {
  published: 'Published to the Knowledge Graph',
  synced: 'Synced with the schema file, but needs published',
  local: 'Requires syncing to the schema file',
} as const satisfies Record<'published' | 'synced' | 'local', React.ReactNode>;
