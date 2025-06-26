'use client';

import { cn } from '@/lib/utils';

interface AppTitleProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'children'> {}

export function AppTitle({ className, ...props }: AppTitleProps) {
  return (
    <h1 className={cn('font-semibold tracking-tight', className)} {...props}>
      Geo{' '}
      <span className="from-violet-1 to-violet-2 dark:from-aqua-1 dark:to-aqua-2 bg-gradient-to-b bg-clip-text text-transparent">
        Connect
      </span>
    </h1>
  );
}
