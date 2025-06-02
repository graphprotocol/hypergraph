import { ExportWallet } from '@/components/export-wallet';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/export-wallet')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
      <ExportWallet />
    </div>
  );
}
