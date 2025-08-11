import { Link, useRouter } from '@tanstack/react-router';
import { clsx } from 'clsx';

type Tab = {
  label: string;
  to: string;
};

const tabs: Tab[] = [
  { label: 'Projects', to: '/explore-public-knowledge/projects' },
  { label: 'dApps', to: '/explore-public-knowledge/dapps' },
  { label: 'Investment Rounts', to: '/explore-public-knowledge/investment-rounts' },
  { label: 'Asset Market', to: '/explore-public-knowledge/asset-market' },
];

export function ExploreTabs() {
  const router = useRouter();
  const pathname = router.state.location.pathname ?? '';

  return (
    <div className="w-full flex justify-center">
      <div className="inline-flex rounded-lg border bg-background p-1">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={clsx(
                'px-4 py-2 text-sm rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground',
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
