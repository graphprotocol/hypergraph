import { Link } from '@tanstack/react-router';
import { clsx } from 'clsx';

type Tab = {
  label: string;
  to: string;
};

const tabs: Tab[] = [
  { label: 'Projects', to: '/explore-public-knowledge/projects' },
  { label: 'dApps', to: '/explore-public-knowledge/dapps' },
  { label: 'Investment Rounds', to: '/explore-public-knowledge/investment-rounds' },
  { label: 'Assets', to: '/explore-public-knowledge/assets' },
];

export function ExploreTabs() {
  return (
    <div className="w-full flex justify-center">
      <div className="inline-flex rounded-lg border bg-background p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            activeOptions={{ exact: false }}
            activeProps={{ className: 'bg-primary text-primary-foreground' }}
            className={clsx(
              'px-4 py-2 text-sm rounded-md transition-colors text-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
