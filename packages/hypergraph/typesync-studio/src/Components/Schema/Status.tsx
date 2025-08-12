'use client';

import { Tooltip } from '@base-ui-components/react/tooltip';
import type { Typesync } from '@graphprotocol/hypergraph';

import { Arrow } from '../Arrow.tsx';

export function SchemaPropertyStatus({ status }: Readonly<{ status: Typesync.TypesyncHypergraphSchemaStatus }>) {
  const content = StatusTooltipContentMap[status || 'typesync_ui'];

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
                <Arrow />
              </Tooltip.Arrow>
              <span className="text-xs text-gray-700 dark:text-white whitespace-break-spaces w-full">{content}</span>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

function CorrectIcon({ status }: Readonly<{ status: Typesync.TypesyncHypergraphSchemaStatus }>) {
  if (status === 'published') {
    // type/property is published to the Knowledge Graph
    return <ExistsInKnowledgeGraph className="size-4 text-inherit" aria-hidden="true" />;
  }
  if (status === 'published_not_synced') {
    // type/property exists in the Knowledge Graph, but needs syncing to the schema file
    return <PublishedToKnowledgeGraphRequiresSyncing className="size-4 text-inherit" aria-hidden="true" />;
  }
  if (status === 'synced') {
    // type/property is synced with the schema.ts file, but needs published to the Knowledge Graph
    return <SyncedRequiredPublishing className="size-4 text-inherit" aria-hidden="true" />;
  }
  // type/property is new/created in the UI. needs to be synced to the file/KG
  return <UIRequiresSyncing className="size-4 text-inherit" aria-hidden="true" />;
}

function ExistsInKnowledgeGraphDark(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="hidden dark:inline-block"
      {...props}
    >
      <title>Exists in Knowledge Graph | Dark Mode</title>
      <g clipPath="url(#clip0_59284_4458)">
        <circle cx="8.0032" cy="1.75" r="1.25" stroke="white" />
        <circle cx="8.0032" cy="14.25" r="1.25" stroke="white" />
        <path d="M7.99641 13.255L8.0032 2.75" stroke="white" />
        <circle cx="13.4159" cy="5.125" r="1.25" transform="rotate(60 13.4159 5.125)" stroke="white" />
        <circle cx="2.59055" cy="11.375" r="1.25" transform="rotate(60 2.59055 11.375)" stroke="white" />
        <path d="M3.44885 10.8716L12.5498 5.625" stroke="white" />
        <circle cx="13.4159" cy="11.375" r="1.25" transform="rotate(120 13.4159 11.375)" stroke="white" />
        <circle cx="2.59055" cy="5.125" r="1.25" transform="rotate(120 2.59055 5.125)" stroke="white" />
        <path d="M3.45564 5.61662L12.5498 10.875" stroke="white" />
      </g>
      <defs>
        <clipPath id="clip0_59284_4458">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
function ExistsInKnowledgeGraphLight(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block dark:hidden"
      {...props}
    >
      <title>Exists in Knowledge Graph | Light Mode</title>
      <g clipPath="url(#clip0_59285_4572)">
        <circle cx="8.0032" cy="1.75" r="1.25" stroke="#2A2A2A" />
        <circle cx="8.0032" cy="14.25" r="1.25" stroke="#2A2A2A" />
        <path d="M7.99641 13.255L8.0032 2.75" stroke="#2A2A2A" />
        <circle cx="13.4159" cy="5.125" r="1.25" transform="rotate(60 13.4159 5.125)" stroke="#2A2A2A" />
        <circle cx="2.59055" cy="11.375" r="1.25" transform="rotate(60 2.59055 11.375)" stroke="#2A2A2A" />
        <path d="M3.44885 10.8716L12.5498 5.625" stroke="#2A2A2A" />
        <circle cx="13.4159" cy="11.375" r="1.25" transform="rotate(120 13.4159 11.375)" stroke="#2A2A2A" />
        <circle cx="2.59055" cy="5.125" r="1.25" transform="rotate(120 2.59055 5.125)" stroke="#2A2A2A" />
        <path d="M3.45564 5.61662L12.5498 10.875" stroke="#2A2A2A" />
      </g>
      <defs>
        <clipPath id="clip0_59285_4572">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
function ExistsInKnowledgeGraph(props: React.ComponentProps<'svg'>) {
  return (
    <>
      <span className="hidden dark:inline-block">
        <ExistsInKnowledgeGraphDark {...props} />
      </span>
      <span className="inline-block dark:hidden">
        <ExistsInKnowledgeGraphLight {...props} />
      </span>
    </>
  );
}

function UIRequiresSyncingLight(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Exists in the Typesync UI | Light Mode</title>
      <g clipPath="url(#clip0_59285_4556)">
        <path
          d="M2 15.0588V14.3091C2 14.029 2.23019 13.8035 2.5103 13.8092V13.8092C2.78237 13.8148 3 14.037 3 14.3091V15H3.63191C3.90805 15 4.13191 15.2239 4.13191 15.5V15.5C4.13191 15.7761 3.90805 16 3.63191 16H2.92308C2.41328 16 2 15.5786 2 15.0588ZM7.01683 15C7.29297 15 7.51683 15.2239 7.51683 15.5V15.5C7.51683 15.7761 7.29297 16 7.01683 16H5.59916C5.32302 16 5.09916 15.7761 5.09916 15.5V15.5C5.09916 15.2239 5.32302 15 5.59916 15H7.01683ZM10.4008 15C10.677 15 10.9008 15.2239 10.9008 15.5V15.5C10.9008 15.7761 10.677 16 10.4008 16H8.98317C8.70703 16 8.48317 15.7761 8.48317 15.5V15.5C8.48317 15.2239 8.70703 15 8.98317 15H10.4008ZM13 15V14.3244C13 14.0483 13.2239 13.8244 13.5 13.8244V13.8244C13.7761 13.8244 14 14.0483 14 14.3244V15.0588C14 15.5786 13.5867 16 13.0769 16H12.3681C12.0919 16 11.8681 15.7761 11.8681 15.5V15.5C11.8681 15.2239 12.0919 15 12.3681 15H13ZM13.4897 10.3772C13.7698 10.3715 14 10.597 14 10.8771V12.3466C14 12.6187 13.7824 12.8409 13.5103 12.8465V12.8465C13.2302 12.8523 13 12.6268 13 12.3466V10.8771C13 10.605 13.2176 10.3829 13.4897 10.3772V10.3772ZM2.5 10.2693C2.77614 10.2693 3 10.4932 3 10.7693V12.2895C3 12.5657 2.77614 12.7895 2.5 12.7895V12.7895C2.22386 12.7895 2 12.5657 2 12.2895V10.7693C2 10.4932 2.22386 10.2693 2.5 10.2693V10.2693ZM13.4409 6.93133C13.7462 6.91964 14 7.16393 14 7.46939V8.86135C14 9.15072 13.7713 9.38835 13.4821 9.39942V9.39942C13.1769 9.4111 12.9231 9.16681 12.9231 8.86135V7.46939C12.9231 7.18002 13.1518 6.9424 13.4409 6.93133V6.93133ZM2.5103 6.75041C2.78237 6.75602 3 6.97817 3 7.2503V8.77031C3 9.05048 2.76981 9.27598 2.4897 9.2702V9.2702C2.21763 9.2646 2 9.04244 2 8.77031V7.2503C2 6.97013 2.23019 6.74463 2.5103 6.75041V6.75041ZM13 4.6875C13 4.5446 13.0133 4.40913 12.9038 4.31985L12.5418 4.02492C12.3444 3.86411 12.3122 3.57483 12.4694 3.37453V3.37453C12.6307 3.16885 12.9295 3.13568 13.1321 3.30096L13.4808 3.58548C13.809 3.85336 14 4.25884 14 4.6875V5.42188C14 5.69802 13.7761 5.92188 13.5 5.92188V5.92188C13.2239 5.92188 13 5.69802 13 5.42187V4.6875ZM2.5 3.21048C2.77614 3.21048 3 3.43434 3 3.71048V5.2307C3 5.50684 2.77614 5.7307 2.5 5.7307V5.7307C2.22386 5.7307 2 5.50684 2 5.2307V3.71048C2 3.43434 2.22386 3.21048 2.5 3.21048V3.21048ZM11.8346 2.24245C12.0319 2.40333 12.064 2.69258 11.9069 2.89288V2.89288C11.7455 3.09859 11.4467 3.13178 11.2441 2.96649L10.5409 2.39283C10.3398 2.22878 10.3071 1.93395 10.4672 1.72978V1.72978V1.72978C10.6251 1.52795 10.918 1.49516 11.1166 1.65707L11.8346 2.24245ZM2 0.941176C2 0.421379 2.41328 1.13692e-08 2.92308 0H3.4363C3.71244 0 3.9363 0.223858 3.9363 0.5V0.5C3.9363 0.776142 3.71244 1 3.4363 1H2.92308V1.73975C2.92308 1.99465 2.71644 2.20129 2.46154 2.20129V2.20129C2.20664 2.20129 2 1.99465 2 1.73975V0.941176ZM8.59946 0C8.9138 4.16766e-05 9.21848 0.109521 9.46394 0.309743L9.82608 0.604764C10.0234 0.765522 10.0556 1.05471 9.89852 1.25496V1.25496C9.73712 1.46066 9.43828 1.49374 9.2358 1.32832L8.88792 1.04412C8.80613 0.977403 8.7042 1.00004 8.59946 1H8.08534C7.80919 1 7.58534 0.776142 7.58534 0.5V0.5C7.58534 0.223858 7.80919 0 8.08534 0H8.59946ZM6.27494 0C6.55108 0 6.77494 0.223858 6.77494 0.5V0.5C6.77494 0.776142 6.55108 1 6.27494 1H5.2476C4.97145 1 4.7476 0.776142 4.7476 0.5V0.5C4.7476 0.223858 4.97145 0 5.2476 0H6.27494Z"
          fill="#2A2A2A"
        />
        <path d="M8.01689 0L8.00154 4.99847C8.00069 5.27521 8.2248 5.5 8.50154 5.5H14" stroke="#2A2A2A" />
      </g>
      <defs>
        <clipPath id="clip0_59285_4556">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
function UIRequiresSyncingDark(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Exists in the Typesync UI | Dark Mode</title>
      <g clipPath="url(#clip0_59284_4447)">
        <path
          d="M2 15.0588V14.3091C2 14.029 2.23019 13.8035 2.5103 13.8092V13.8092C2.78237 13.8148 3 14.037 3 14.3091V15H3.63191C3.90805 15 4.13191 15.2239 4.13191 15.5V15.5C4.13191 15.7761 3.90805 16 3.63191 16H2.92308C2.41328 16 2 15.5786 2 15.0588ZM7.01683 15C7.29297 15 7.51683 15.2239 7.51683 15.5V15.5C7.51683 15.7761 7.29297 16 7.01683 16H5.59916C5.32302 16 5.09916 15.7761 5.09916 15.5V15.5C5.09916 15.2239 5.32302 15 5.59916 15H7.01683ZM10.4008 15C10.677 15 10.9008 15.2239 10.9008 15.5V15.5C10.9008 15.7761 10.677 16 10.4008 16H8.98317C8.70703 16 8.48317 15.7761 8.48317 15.5V15.5C8.48317 15.2239 8.70703 15 8.98317 15H10.4008ZM13 15V14.3244C13 14.0483 13.2239 13.8244 13.5 13.8244V13.8244C13.7761 13.8244 14 14.0483 14 14.3244V15.0588C14 15.5786 13.5867 16 13.0769 16H12.3681C12.0919 16 11.8681 15.7761 11.8681 15.5V15.5C11.8681 15.2239 12.0919 15 12.3681 15H13ZM13.4897 10.3772C13.7698 10.3715 14 10.597 14 10.8771V12.3466C14 12.6187 13.7824 12.8409 13.5103 12.8465V12.8465C13.2302 12.8523 13 12.6268 13 12.3466V10.8771C13 10.605 13.2176 10.3829 13.4897 10.3772V10.3772ZM2.5 10.2693C2.77614 10.2693 3 10.4932 3 10.7693V12.2895C3 12.5657 2.77614 12.7895 2.5 12.7895V12.7895C2.22386 12.7895 2 12.5657 2 12.2895V10.7693C2 10.4932 2.22386 10.2693 2.5 10.2693V10.2693ZM13.4409 6.93133C13.7462 6.91964 14 7.16393 14 7.46939V8.86135C14 9.15072 13.7713 9.38835 13.4821 9.39942V9.39942C13.1769 9.4111 12.9231 9.16681 12.9231 8.86135V7.46939C12.9231 7.18002 13.1518 6.9424 13.4409 6.93133V6.93133ZM2.5103 6.75041C2.78237 6.75602 3 6.97817 3 7.2503V8.77031C3 9.05048 2.76981 9.27598 2.4897 9.2702V9.2702C2.21763 9.2646 2 9.04244 2 8.77031V7.2503C2 6.97013 2.23019 6.74463 2.5103 6.75041V6.75041ZM13 4.6875C13 4.5446 13.0133 4.40913 12.9038 4.31985L12.5418 4.02492C12.3444 3.86411 12.3122 3.57483 12.4694 3.37453V3.37453C12.6307 3.16885 12.9295 3.13568 13.1321 3.30096L13.4808 3.58548C13.809 3.85336 14 4.25884 14 4.6875V5.42188C14 5.69802 13.7761 5.92188 13.5 5.92188V5.92188C13.2239 5.92188 13 5.69802 13 5.42187V4.6875ZM2.5 3.21048C2.77614 3.21048 3 3.43434 3 3.71048V5.2307C3 5.50684 2.77614 5.7307 2.5 5.7307V5.7307C2.22386 5.7307 2 5.50684 2 5.2307V3.71048C2 3.43434 2.22386 3.21048 2.5 3.21048V3.21048ZM11.8346 2.24245C12.0319 2.40333 12.064 2.69258 11.9069 2.89288V2.89288C11.7455 3.09859 11.4467 3.13178 11.2441 2.96649L10.5409 2.39283C10.3398 2.22878 10.3071 1.93395 10.4672 1.72978V1.72978V1.72978C10.6251 1.52795 10.918 1.49516 11.1166 1.65707L11.8346 2.24245ZM2 0.941176C2 0.421379 2.41328 1.13692e-08 2.92308 0H3.4363C3.71244 0 3.9363 0.223858 3.9363 0.5V0.5C3.9363 0.776142 3.71244 1 3.4363 1H2.92308V1.73975C2.92308 1.99465 2.71644 2.20129 2.46154 2.20129V2.20129C2.20664 2.20129 2 1.99465 2 1.73975V0.941176ZM8.59946 0C8.9138 4.16766e-05 9.21848 0.109521 9.46394 0.309743L9.82608 0.604764C10.0234 0.765522 10.0556 1.05471 9.89852 1.25496V1.25496C9.73712 1.46066 9.43828 1.49374 9.2358 1.32832L8.88792 1.04412C8.80613 0.977403 8.7042 1.00004 8.59946 1H8.08534C7.80919 1 7.58534 0.776142 7.58534 0.5V0.5C7.58534 0.223858 7.80919 0 8.08534 0H8.59946ZM6.27494 0C6.55108 0 6.77494 0.223858 6.77494 0.5V0.5C6.77494 0.776142 6.55108 1 6.27494 1H5.2476C4.97145 1 4.7476 0.776142 4.7476 0.5V0.5C4.7476 0.223858 4.97145 0 5.2476 0H6.27494Z"
          fill="white"
        />
        <path d="M8.01689 0L8.00154 4.99847C8.00069 5.27521 8.2248 5.5 8.50154 5.5H14" stroke="white" />
      </g>
      <defs>
        <clipPath id="clip0_59284_4447">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
function UIRequiresSyncing(props: React.ComponentProps<'svg'>) {
  return (
    <>
      <span className="hidden dark:inline-block">
        <UIRequiresSyncingDark {...props} />
      </span>
      <span className="inline-block dark:hidden">
        <UIRequiresSyncingLight {...props} />
      </span>
    </>
  );
}

function SyncedRequiredPublishingLight(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Synced to the schema file, requires publishing | Light Mode</title>
      <g clipPath="url(#clip0_59285_4566)">
        <path d="M8 5V0.5H9L13.5 4.5V5H8Z" fill="#2A2A2A" />
        <path
          d="M3.5 0.5H8.61621C8.73973 0.5 8.85936 0.545299 8.95117 0.62793L13.335 4.57324C13.4403 4.66805 13.5 4.8036 13.5 4.94531V14.5C13.5 15.0523 13.0523 15.5 12.5 15.5H3.5C2.94772 15.5 2.5 15.0523 2.5 14.5V1.5C2.5 0.947715 2.94772 0.5 3.5 0.5Z"
          stroke="#2A2A2A"
        />
        <path
          d="M7.67993 12.0595H8.86631C8.99425 12.4899 9.37807 12.7109 9.88984 12.7109C10.4249 12.7109 10.7738 12.5015 10.7738 12.0944C10.7738 11.8153 10.5993 11.6641 10.169 11.5594L9.09893 11.3035C8.36617 11.129 7.81951 10.7336 7.81951 9.88451C7.81951 8.95402 8.64531 8.26778 9.77353 8.26778C10.9832 8.26778 11.6694 8.84934 11.8439 9.79146H10.704C10.5993 9.45416 10.2969 9.22154 9.7619 9.22154C9.35481 9.22154 8.93609 9.40763 8.93609 9.81472C8.93609 10.0473 9.09893 10.1985 9.47112 10.2916L10.5644 10.5475C11.4484 10.7568 11.8904 11.257 11.8904 12.013C11.8904 13.0365 11.0413 13.6646 9.87821 13.6646C8.66858 13.6646 7.83114 13.0598 7.67993 12.0595Z"
          fill="#2A2A2A"
        />
        <path
          d="M4.81418 12.1526V9.34949H4V8.3841H4.81418V7H5.97729V8.3841H7.1404V9.34949H5.97729V12.0246C5.97729 12.4434 6.20991 12.6295 6.59374 12.6295C6.82636 12.6295 7.09388 12.5364 7.25671 12.4201V13.4785C7.05898 13.5948 6.74494 13.6646 6.38438 13.6646C5.46552 13.6646 4.81418 13.1761 4.81418 12.1526Z"
          fill="#2A2A2A"
        />
        <path d="M8.01689 0L8.00169 4.49831C8.00076 4.77511 8.22489 5 8.50169 5H13.75" stroke="#2A2A2A" />
      </g>
      <defs>
        <clipPath id="clip0_59285_4566">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
function SyncedRequiredPublishingDark(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Synced to the schema file, requires publishing | Dark Mode</title>
      <g clipPath="url(#clip0_59288_4647)">
        <path d="M8 5V0.5H9L13.5 4.5V5H8Z" fill="white" />
        <path
          d="M3.5 0.5H8.61621C8.73973 0.5 8.85936 0.545299 8.95117 0.62793L13.335 4.57324C13.4403 4.66805 13.5 4.8036 13.5 4.94531V14.5C13.5 15.0523 13.0523 15.5 12.5 15.5H3.5C2.94772 15.5 2.5 15.0523 2.5 14.5V1.5C2.5 0.947715 2.94772 0.5 3.5 0.5Z"
          stroke="white"
        />
        <path
          d="M7.67993 12.0595H8.86631C8.99425 12.4899 9.37807 12.7109 9.88984 12.7109C10.4249 12.7109 10.7738 12.5015 10.7738 12.0944C10.7738 11.8153 10.5993 11.6641 10.169 11.5594L9.09893 11.3035C8.36617 11.129 7.81951 10.7336 7.81951 9.88451C7.81951 8.95402 8.64531 8.26778 9.77353 8.26778C10.9832 8.26778 11.6694 8.84934 11.8439 9.79146H10.704C10.5993 9.45416 10.2969 9.22154 9.7619 9.22154C9.35481 9.22154 8.93609 9.40763 8.93609 9.81472C8.93609 10.0473 9.09893 10.1985 9.47112 10.2916L10.5644 10.5475C11.4484 10.7568 11.8904 11.257 11.8904 12.013C11.8904 13.0365 11.0413 13.6646 9.87821 13.6646C8.66858 13.6646 7.83114 13.0598 7.67993 12.0595Z"
          fill="white"
        />
        <path
          d="M4.81418 12.1526V9.34949H4V8.3841H4.81418V7H5.97729V8.3841H7.1404V9.34949H5.97729V12.0246C5.97729 12.4434 6.20991 12.6295 6.59374 12.6295C6.82636 12.6295 7.09388 12.5364 7.25671 12.4201V13.4785C7.05898 13.5948 6.74494 13.6646 6.38438 13.6646C5.46552 13.6646 4.81418 13.1761 4.81418 12.1526Z"
          fill="white"
        />
        <path d="M8.01689 0L8.00169 4.49831C8.00076 4.77511 8.22489 5 8.50169 5H13.75" stroke="white" />
      </g>
      <defs>
        <clipPath id="clip0_59288_4647">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
function SyncedRequiredPublishing(props: React.ComponentProps<'svg'>) {
  return (
    <>
      <span className="hidden dark:inline-block">
        <SyncedRequiredPublishingDark {...props} />
      </span>
      <span className="inline-block dark:hidden">
        <SyncedRequiredPublishingLight {...props} />
      </span>
    </>
  );
}

function PublishedToKnowledgeGraphRequiresSyncingLight(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Published to the Knowledge Graph, but requires syncing to the schema file | Light Mode</title>
      <path
        d="M14.0291 8.02593C14.0291 4.53221 11.2275 1.7 7.77153 1.7C5.64507 1.7 3.76635 2.77226 2.63557 4.41111"
        stroke="#2A2A2A"
        stroke-linecap="round"
      />
      <path d="M14.0291 8.47779L15.37 7.12223" stroke="#2A2A2A" stroke-linecap="round" />
      <path d="M14.0291 8.47779L12.6882 7.12223" stroke="#2A2A2A" stroke-linecap="round" />
      <path
        d="M1.96091 7.97407C1.96091 11.4678 4.76252 14.3 8.21848 14.3C10.3449 14.3 12.2237 13.2277 13.3544 11.5889"
        stroke="#2A2A2A"
        stroke-linecap="round"
      />
      <path d="M1.96091 7.52222L0.620003 8.87778" stroke="#2A2A2A" stroke-linecap="round" />
      <path d="M1.96091 7.52222L3.30182 8.87778" stroke="#2A2A2A" stroke-linecap="round" />
      <path
        d="M6 4.5H8.11621C8.23973 4.5 8.35936 4.5453 8.45117 4.62793L10.335 6.32324C10.4403 6.41805 10.5 6.5536 10.5 6.69531V11C10.5 11.2761 10.2761 11.5 10 11.5H6C5.72386 11.5 5.5 11.2761 5.5 11V5C5.5 4.72386 5.72386 4.5 6 4.5Z"
        stroke="#2A2A2A"
      />
      <path d="M8 6.5V4.5L10.5 7H8.5C8.22386 7 8 6.77614 8 6.5Z" fill="#2A2A2A" />
    </svg>
  );
}
function PublishedToKnowledgeGraphRequiresSyncingDark(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Published to the Knowledge Graph, but requires syncing to the schema file | Dark Mode</title>
      <path
        d="M14.0291 8.02593C14.0291 4.53221 11.2275 1.7 7.77153 1.7C5.64507 1.7 3.76635 2.77226 2.63557 4.41111"
        stroke="white"
        stroke-linecap="round"
      />
      <path d="M14.0291 8.47779L15.37 7.12223" stroke="white" stroke-linecap="round" />
      <path d="M14.0291 8.47779L12.6882 7.12223" stroke="white" stroke-linecap="round" />
      <path
        d="M1.96091 7.97407C1.96091 11.4678 4.76252 14.3 8.21848 14.3C10.3449 14.3 12.2237 13.2277 13.3544 11.5889"
        stroke="white"
        stroke-linecap="round"
      />
      <path d="M1.96091 7.52222L0.620003 8.87778" stroke="white" stroke-linecap="round" />
      <path d="M1.96091 7.52222L3.30182 8.87778" stroke="white" stroke-linecap="round" />
      <path
        d="M6 4.5H8.11621C8.23973 4.5 8.35936 4.5453 8.45117 4.62793L10.335 6.32324C10.4403 6.41805 10.5 6.5536 10.5 6.69531V11C10.5 11.2761 10.2761 11.5 10 11.5H6C5.72386 11.5 5.5 11.2761 5.5 11V5C5.5 4.72386 5.72386 4.5 6 4.5Z"
        stroke="white"
      />
      <path d="M8 6.5V4.5L10.5 7H8.5C8.22386 7 8 6.77614 8 6.5Z" fill="white" />
    </svg>
  );
}
function PublishedToKnowledgeGraphRequiresSyncing(props: React.ComponentProps<'svg'>) {
  return (
    <>
      <span className="hidden dark:inline-block">
        <PublishedToKnowledgeGraphRequiresSyncingDark {...props} />
      </span>
      <span className="inline-block dark:hidden">
        <PublishedToKnowledgeGraphRequiresSyncingLight {...props} />
      </span>
    </>
  );
}

const StatusTooltipContentMap = {
  published: 'Published to the Knowledge Graph',
  synced: 'Synced with the schema file, but needs published',
  typesync_ui: 'Requires syncing to the schema file',
  published_not_synced: 'Published to the Knowledge Graph, but requires syncing to the schema file',
} as const satisfies Record<'published' | 'synced' | 'published_not_synced' | 'typesync_ui', React.ReactNode>;
