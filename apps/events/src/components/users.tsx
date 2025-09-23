import { useCreateEntityNew, useQueryNew, useSpace } from '@graphprotocol/hypergraph-react';
import { useState } from 'react';
import { UserNew } from '../schema.js';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import { UserEntry } from './user-entry.js';

export const Users = () => {
  const { data: users } = useQueryNew(UserNew, { mode: 'private' });
  const { ready: spaceReady } = useSpace({ mode: 'private' });
  const createEntityNew = useCreateEntityNew(UserNew);
  const [newUserName, setNewUserName] = useState('');

  console.log(users);

  if (!spaceReady) {
    return <div>Loading space...</div>;
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="flex flex-row gap-2">
        <Input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
        <Button
          onClick={() => {
            // createEntity({ name: newUserName });
            const user = createEntityNew({ name: newUserName });
            console.log(user);
            setNewUserName('');
          }}
        >
          Create User
        </Button>
      </div>
      {users.map((user) => (
        <UserEntry key={user.id} {...user} />
      ))}
    </>
  );
};
