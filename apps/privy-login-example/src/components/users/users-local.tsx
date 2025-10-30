import { useEntities, useHardDeleteEntity } from '@graphprotocol/hypergraph-react';
import { User } from '../../schema';
import { Button } from '../ui/button';

export const UsersLocal = () => {
  const hardDeleteEntity = useHardDeleteEntity();
  const { data: usersLocalData, deleted: deletedUsersLocalData } = useEntities(User, { mode: 'private' });

  return (
    <>
      <h2 className="text-2xl font-bold">Users (Local)</h2>
      {usersLocalData.map((user) => (
        <div key={user.id} className="flex flex-row items-center gap-2">
          <h2>{user.name}</h2>
          <div className="text-xs">{user.id}</div>
          {/* @ts-expect-error */}
          <div className="text-xs">{user.__deleted ? 'deleted' : 'not deleted'}</div>
          <Button variant="secondary" size="sm" onClick={() => hardDeleteEntity(user.id)}>
            Hard Delete
          </Button>
        </div>
      ))}
      <h2 className="text-2xl font-bold">Deleted Users (Local)</h2>
      {deletedUsersLocalData.map((user) => (
        <div key={user.id} className="flex flex-row items-center gap-2">
          <h2>{user.name}</h2>
          <div className="text-xs">{user.id}</div>
          <Button variant="secondary" size="sm" onClick={() => hardDeleteEntity(user.id)}>
            Hard Delete
          </Button>
        </div>
      ))}
    </>
  );
};
