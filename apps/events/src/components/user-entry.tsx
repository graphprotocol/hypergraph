import { preparePublish, useDeleteEntity, useUpdateEntity } from '@graphprotocol/hypergraph-react';
import { useState } from 'react';
import { User } from '../schema.js';
import { Button } from './ui/button';
import { Input } from './ui/input.js';

export const UserEntry = (user: User & { id: string }) => {
  const deleteEntity = useDeleteEntity();
  const updateEntity = useUpdateEntity(User);
  const [editMode, setEditMode] = useState(false);

  const handlePublish = async () => {
    const result = await preparePublish({ entity: user, publicTargetSpace: 'abc' });
    console.log(result);
  };

  return (
    <div key={user.id} className="flex flex-row items-center gap-2">
      <h2>
        {user.name} <span className="text-xs text-gray-500">({user.id})</span>
      </h2>
      <Button onClick={() => deleteEntity(user.id)}>Delete</Button>
      <Button onClick={() => setEditMode((prev) => !prev)}>Edit User</Button>
      <Button onClick={handlePublish}>Publish</Button>

      {editMode && (
        <Input type="text" value={user.name} onChange={(e) => updateEntity(user.id, { name: e.target.value })} />
      )}
    </div>
  );
};
