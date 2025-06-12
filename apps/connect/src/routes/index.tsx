import { useIdentityToken } from '@privy-io/react-auth';
import { createFileRoute } from '@tanstack/react-router';
import { CreateSpace } from '../components/create-space';
import { Spaces } from '../components/spaces';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { identityToken } = useIdentityToken();
  if (!identityToken) {
    return <div>Loading…</div>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
      <h2 className="text-lg font-bold">Welcome to Connect</h2>
      <CreateSpace />
      <Spaces />
    </div>
  );
}
