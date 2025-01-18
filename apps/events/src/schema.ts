import { Schema } from '@graphprotocol/hypergraph';

export class Todo extends Schema.Class<Todo>('Todo')({
  id: Schema.Generated(Schema.Text),
  name: Schema.Text,
  completed: Schema.Checkbox,
}) {}
