'use client';

import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Tab = {
  label: string;
  href: string;
};

const tabs: Tab[] = [
  { label: 'Projects', href: '/explore-public-knowledge/projects' },
  { label: 'dApps', href: '/explore-public-knowledge/dapps' },
  { label: 'Investment Rounds', href: '/explore-public-knowledge/investment-rounds' },
  { label: 'Assets', href: '/explore-public-knowledge/assets' },
];

export function ExploreTabs() {
  const pathname = usePathname();

  return (
    <div className="w-full flex justify-center">
      <div className="inline-flex rounded-lg border bg-background p-1">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'px-4 py-2 text-sm rounded-md transition-colors text-foreground hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-primary text-primary-foreground',
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}


