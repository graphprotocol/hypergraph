import { Entity } from '@graphprotocol/hypergraph';

export class User extends Entity.Class<User>('User')({
  name: Entity.Text,
}) {}

export class Todo extends Entity.Class<Todo>('Todo')({
  name: Entity.Text,
  completed: Entity.Checkbox,
  assignees: Entity.Relation(User),
}) {}

export class Todo2 extends Entity.Class<Todo2>('Todo2')({
  name: Entity.Text,
  checked: Entity.Checkbox,
  assignees: Entity.Relation(User),
  due: Entity.Date,
  amount: Entity.Number,
  point: Entity.Point,
  website: Entity.Url,
}) {}

export class NewsStory extends Entity.Class<NewsStory>('NewsStory')({
  name: Entity.Text,
  description: Entity.Text,
  publishDate: Entity.Text,
}) {}
