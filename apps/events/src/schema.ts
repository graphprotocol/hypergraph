import { Entity } from '@graphprotocol/hypergraph';

export class User extends Entity.Class<User>('User')({
  id: Entity.Generated(Entity.Text),
  name: Entity.Text,
}) {}

export class Todo extends Entity.Class<Todo>('Todo')({
  id: Entity.Generated(Entity.Text),
  name: Entity.Text,
  completed: Entity.Checkbox,
  assignees: Entity.Reference(Entity.ReferenceArray(User)),
}) {}
