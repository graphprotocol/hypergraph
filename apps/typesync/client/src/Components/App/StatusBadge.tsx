import type { App } from '../../schema.js';

export function AppStatusBadge(props: Readonly<{ status: App['status'] }>) {
  return (
    <span
      data-status={props.status.replaceAll('_', '')}
      className="rounded-md px-2 py-1 text-xs inline-flex items-center font-medium ring-1 ring-inset capitalize data-[status=draft]:text-gray-600 dark:data-[status=draft]:text-gray-400 data-[status=draft]:bg-gray-50 dark:data-[status=draft]:bg-gray-400/10 data-[status=draft]:ring-gray-500/10 data-[status=published]:text-green-700 data-[status=published]:bg-green-50 data-[status=published]:ring-green-600/20 dark:data-[status=published]:text-green-400 dark:data-[status=published]:bg-green-500/10 dark:data-[status=published]:ring-green-500/20 data-[status=generated]:text-indigo-400 data-[status=generated]:bg-indigo-400/10 data-[status=generated]:ring-indigo-400/30 data-[status=changedetected]:text-purple-400 data-[status=changedetected]:bg-purple-400/10 data-[status=changedetected]:ring-purple-400/30"
    >
      {props.status.replaceAll('_', ' ')}
    </span>
  );
}
