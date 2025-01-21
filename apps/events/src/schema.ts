import { Entity } from '@graphprotocol/hypergraph';

export class Todo extends Entity.Class<Todo>('Todo')({
  id: Entity.Generated(Entity.Text),
  name: Entity.Text,
  completed: Entity.Checkbox,
}) {}
