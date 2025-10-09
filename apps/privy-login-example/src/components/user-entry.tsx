import type { Entity } from '@graphprotocol/hypergraph';
import { useDeleteEntity, useUpdateEntity } from '@graphprotocol/hypergraph-react';
import { useState } from 'react';
import { User } from '../schema.js';
import { Button } from './ui/button';
import { Input } from './ui/input.js';

export const UserEntry = (user: Entity.Entity<typeof User> & { id: string }) => {
  const deleteEntity = useDeleteEntity();
  const updateEntity = useUpdateEntity(User);
  const [editMode, setEditMode] = useState(false);

  return (
    <div key={user.id} className="flex flex-row items-center gap-2">
      <h2>
        {user.name} <span className="text-xs text-gray-500">({user.id})</span>
      </h2>
      <Button onClick={() => deleteEntity(user.id)}>Delete</Button>
      <Button onClick={() => setEditMode((prev) => !prev)}>Edit User</Button>

      {editMode && (
        <Input type="text" value={user.name} onChange={(e) => updateEntity(user.id, { name: e.target.value })} />
      )}
    </div>
  );
};
