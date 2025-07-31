'use client';

import { cn } from '@/lib/utils';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default false */
  hideLabel?: boolean;
  /** @default 'Loading...' */
  children?: React.ReactNode;
}

export function Loading({ hideLabel = false, className, children = 'Loading...', ...props }: LoadingProps) {
  return (
    <span
      data-hide-label={hideLabel || undefined}
      className={cn('group/loading flex items-center gap-[0.5em] font-semibold', className)}
      {...props}
    >
      <LoadingIcon className="size-[1em] shrink-0 animate-spin" />
      {children ? <div className="group-data-[hide-label]/loading:sr-only">{children}</div> : null}
    </span>
  );
}

function LoadingIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      role="presentation"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
