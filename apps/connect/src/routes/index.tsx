import { Graph } from '@graphprotocol/grc-20';
import { useIdentityToken } from '@privy-io/react-auth';
import { createFileRoute } from '@tanstack/react-router';
import { CreateSpaceCard } from '@/components/CreateSpaceCard';
import { SpacesCard } from '@/components/SpacesCard';
import { Loading } from '@/components/ui/Loading';
import { usePrivateSpaces } from '@/hooks/use-private-spaces';
import { usePublicSpaces } from '@/hooks/use-public-spaces';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { identityToken } = useIdentityToken();

  if (!identityToken) {
    return (
      <div className="flex grow flex-col items-center justify-center">
        <div className="c-card c-card--small">
          <Loading className="text-xl" />
        </div>
      </div>
    );
  }

  return <Authorized />;
}

function Authorized() {
  const { isPending: privateSpacesPending, error: privateSpacesError, data: privateSpacesData } = usePrivateSpaces();
  const {
    isPending: publicSpacesPending,
    error: publicSpacesError,
    data: publicSpacesData,
  } = usePublicSpaces(`${Graph.TESTNET_API_ORIGIN}/v2/graphql`);

  return (
    <div className="flex grow flex-col items-center justify-center">
      <div className="grid w-xl max-w-full flex-col gap-6 lg:w-4xl lg:grid-cols-2 lg:gap-8 2xl:w-6xl">
        <div className="relative min-h-80 lg:row-span-2">
          <SpacesCard
            spaces={[...(privateSpacesData ?? []), ...(publicSpacesData ?? [])]}
            status={
              privateSpacesPending || publicSpacesPending
                ? 'loading'
                : privateSpacesError || publicSpacesError
                  ? { error: privateSpacesError?.message || publicSpacesError?.message || 'Unknown error' }
                  : undefined
            }
            className="lg:absolute lg:inset-0"
          />
        </div>
        <CreateSpaceCard className="lg:col-2" />
        <div className="c-card bg-gradient-clearmint lg:col-2 lg:row-2">
          <h2 className="c-card-title text-foreground-dark">What is this?</h2>
          <p>
            Geo Connect allows you to manage your private and public spaces on the decentralized web and grant apps
            access to them.
          </p>
        </div>
      </div>
    </div>
  );
}
