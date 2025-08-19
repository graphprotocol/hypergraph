import { ExploreTabs } from '@/components/explore-tabs';
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/explore-public-knowledge')({
  component: ExploreLayout,
});

function ExploreLayout() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Explore Public Knowledge
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          This page demonstrates how to query public data from the public space{' '}
          <span className="inline-flex items-center rounded-full border bg-accent/60 text-accent-foreground px-2 py-0.5 text-sm align-middle">
            Crypto
          </span>{' '}
          with the ID{' '}
          <span className="inline-flex items-center rounded-full border bg-accent/60 text-accent-foreground px-2 py-0.5 text-xs font-mono align-middle">
            b2565802-3118-47be-91f2-e59170735bac
          </span>
          . No authentication is required.
        </p>
      </div>

      <ExploreTabs />
      <div className="mt-12">
        <Outlet />
      </div>
    </div>
  );
}
