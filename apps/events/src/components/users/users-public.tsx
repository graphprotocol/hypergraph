import { _generateDeleteOps, publishOps, useHypergraphApp, useQuery, useSpace } from '@graphprotocol/hypergraph-react';
import { User } from '../../schema';
import { Spinner } from '../spinner';
import { Button } from '../ui/button';

export const UsersPublic = () => {
  const { id: spaceId } = useSpace({ mode: 'public' });
  const { data: dataPublic, isLoading: isLoadingPublic, isError: isErrorPublic } = useQuery(User, { mode: 'public' });
  const { getSmartSessionClient } = useHypergraphApp();
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
              const smartSessionClient = await getSmartSessionClient();
              if (!smartSessionClient) {
                throw new Error('Missing smartSessionClient');
              }
              const ops = await _generateDeleteOps({ id: user.id, space: spaceId });
              const result = await publishOps({
                ops,
                walletClient: smartSessionClient,
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
