import { useIdentityToken } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';

export function Spaces() {
  const { identityToken } = useIdentityToken();

  const { isPending, error, data } = useQuery<{
    spaces: {
      id: string;
      name: string;
      appIdentities: { address: string; appId: string }[];
      keyBoxes: {
        id: string;
        ciphertext: string;
        nonce: string;
        authorPublicKey: string;
      }[];
    }[];
  }>({
    queryKey: ['spaces'],
    queryFn: async () => {
      if (!identityToken) return;
      const response = await fetch(`${import.meta.env.VITE_HYPERGRAPH_SYNC_SERVER_ORIGIN}/connect/spaces`, {
        headers: { 'privy-id-token': identityToken },
      });
      return await response.json();
    },
  });

  if (isPending) return 'Loading spaces …';

  if (error) return `An error has occurred: ${error.message}`;

  return (
    <>
      {data.spaces.map((space) => (
        <div key={space.id}>
          <h2>
            {space.name} ({space.id})
            <br />
            ---------
            <br />
            {space.appIdentities.map((appIdentity) => (
              <div key={appIdentity.address}>
                {appIdentity.appId} ({appIdentity.address})
              </div>
            ))}
          </h2>
        </div>
      ))}
    </>
  );
}
