import { Model, Types } from '@graphprotocol/graph-framework';

export class Todo extends Model.Class<Todo>('Todo')({
  id: Model.Generated(Types.Text),
  name: Types.Text,
  completed: Types.Checkbox,
}) {}
