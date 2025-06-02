import { Entity, Type } from '@graphprotocol/hypergraph';

export class User extends Entity.Class<User>('User')({
  name: Type.Text,
}) {}

export class Todo extends Entity.Class<Todo>('Todo')({
  name: Type.Text,
  completed: Type.Checkbox,
  assignees: Type.Relation(User),
}) {}

export class Todo2 extends Entity.Class<Todo2>('Todo2')({
  name: Type.Text,
  checked: Type.Checkbox,
  assignees: Type.Relation(User),
  due: Type.Date,
  amount: Type.Number,
  point: Type.Point,
  website: Type.Url,
}) {}

export class NewsStory extends Entity.Class<NewsStory>('NewsStory')({
  name: Type.Text,
  description: Type.Text,
  publishDate: Type.Text,
}) {}
