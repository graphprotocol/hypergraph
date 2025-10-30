import { useDeleteEntity, useEntities } from '@graphprotocol/hypergraph-react';
import { User } from '../../schema';
import { Spinner } from '../spinner';
import { Button } from '../ui/button';

export const UsersMerged = () => {
  const { data, isLoading, isError } = useEntities(User, { mode: 'private' });
  const deleteEntity = useDeleteEntity();

  return (
    <>
      <div className="flex flex-row gap-4 items-center">
        <h2 className="text-2xl font-bold">Users (Merged)</h2>
        {isLoading && <Spinner size="sm" />}
      </div>
      {isError && <div>Error loading users</div>}
      {data.map((user) => (
        <div key={user.id} className="flex flex-row items-center gap-2">
          <h2>{user.name}</h2>
          <div className="text-xs">{user.id}</div>

          <Button variant="outline" size="sm" onClick={() => deleteEntity(user.id)}>
            Delete
          </Button>
        </div>
      ))}
    </>
  );
};
