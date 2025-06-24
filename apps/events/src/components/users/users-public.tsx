import { getSmartAccountWalletClient } from '@/lib/smart-account';
import { _generateDeleteOps, publishOps, useQuery, useSpace } from '@graphprotocol/hypergraph-react';
import { User } from '../../schema';
import { Spinner } from '../spinner';
import { Button } from '../ui/button';

export const UsersPublic = () => {
  const { id: spaceId } = useSpace({ mode: 'public' });
  const { data: dataPublic, isLoading: isLoadingPublic, isError: isErrorPublic } = useQuery(User, { mode: 'public' });

  return (
    <>
      <div className="flex flex-row gap-4 items-center">
        <h2 className="text-2xl font-bold">Users (Public Geo)</h2>
        {isLoadingPublic && <Spinner size="sm" />}
      </div>
      {isErrorPublic && <div>Error loading users</div>}
      {dataPublic.map((user) => (
        <div key={user.id} className="flex flex-row items-center gap-2">
          <h2>{user.name}</h2>
          <div className="text-xs">{user.id}</div>

          <Button
            onClick={async () => {
              const smartAccountWalletClient = await getSmartAccountWalletClient();
              if (!smartAccountWalletClient) {
                throw new Error('Missing smartAccountWalletClient');
              }
              const ops = await _generateDeleteOps({ id: user.id, space: spaceId });
              const result = await publishOps({
                ops,
                // @ts-expect-error - TODO: fix the types error
                walletClient: smartAccountWalletClient,
                space: spaceId,
                name: 'Delete User',
              });
              console.log('result', result);
            }}
          >
            Delete
          </Button>
        </div>
      ))}
    </>
  );
};
