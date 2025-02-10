import { useCreateEntity, useDeleteEntity, useQueryEntities } from '@graphprotocol/hypergraph-react';
import { useState } from 'react';
import { User } from '../schema';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const Users = () => {
  const users = useQueryEntities(User);
  const createEntity = useCreateEntity(User);
  const deleteEntity = useDeleteEntity();
  const [newUserName, setNewUserName] = useState('');

  return (
    <>
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="flex flex-row gap-2">
        <Input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
        <Button
          onClick={() => {
            createEntity({ name: newUserName });
            setNewUserName('');
          }}
        >
          Create User
        </Button>
      </div>
      {users.map((user) => (
        <div key={user.id} className="flex flex-row items-center gap-2">
          <h2>
            {user.name} <span className="text-xs text-gray-500">({user.id})</span>
          </h2>
          <Button onClick={() => deleteEntity(user.id)}>Delete</Button>
        </div>
      ))}
    </>
  );
};
