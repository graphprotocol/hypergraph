'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default false */
  hideLabel?: boolean;
  /** @default 'Loading...' */
  children?: React.ReactNode;
}

export function Loading({ hideLabel = false, className, children = 'Loading...', ...props }: LoadingProps) {
  return (
    <div
      data-hide-label={hideLabel || undefined}
      className={cn('group/loading flex items-center gap-[0.5em] font-semibold', className)}
      {...props}
    >
      <Loader2 className="size-[1em] shrink-0 animate-spin" />
      {children ? <div className="group-data-[hide-label]/loading:sr-only">{children}</div> : null}
    </div>
  );
}
