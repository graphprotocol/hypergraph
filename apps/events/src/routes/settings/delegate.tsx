import { Delegate } from '@/components/delegate';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/delegate')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 max-w-screen-sm mx-auto py-8">
      <Delegate />
    </div>
  );
}
