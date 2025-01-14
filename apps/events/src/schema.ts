import { Schema } from '@graphprotocol/hypergraph';

export class Todo extends Schema.Model.Class<Todo>('Todo')({
  id: Schema.Model.Generated(Schema.Types.Text),
  name: Schema.Types.Text,
  completed: Schema.Types.Checkbox,
}) {}
