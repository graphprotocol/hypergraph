import { Entity, EntityNew, Id, Type, TypeNew } from '@graphprotocol/hypergraph';

export class User extends Entity.Class<User>('User')({
  name: Type.String,
}) {}

export class Todo extends Entity.Class<Todo>('Todo')({
  name: Type.String,
  completed: Type.Boolean,
  assignees: Type.Relation(User),
}) {}

export class Todo2 extends Entity.Class<Todo2>('Todo2')({
  name: Type.String,
  checked: Type.Boolean,
  assignees: Type.Relation(User),
  due: Type.Date,
  amount: Type.Number,
  point: Type.Point,
  website: Type.String,
}) {}

export class JobOffer extends Entity.Class<JobOffer>('JobOffer')({
  name: Type.String,
  salary: Type.Number,
}) {}

export class Company extends Entity.Class<Company>('Company')({
  name: Type.String,
  jobOffers: Type.Relation(JobOffer),
}) {}

export class Event extends Entity.Class<Event>('Event')({
  name: Type.String,
  description: Type.optional(Type.String),
  sponsors: Type.Relation(Company),
}) {}

export class Todo3 extends Entity.Class<Todo3>('Todo3')({
  name: Type.String,
  completed: Type.Boolean,
  description: Type.String,
}) {}

export const UserNew = EntityNew(
  {
    name: TypeNew.String,
  },
  {
    types: [Id('bffa181e-a333-495b-949c-57f2831d7eca')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
  },
);

export const TodoNew = EntityNew(
  {
    name: TypeNew.String,
    completed: TypeNew.Boolean,
    assignees: TypeNew.Relation(UserNew),
  },
  {
    types: [Id('44fe82a9-e4c2-4330-a395-ce85ed78e421')],
    properties: {
      name: Id('c668aa67-bbca-4b2c-908c-9c5599035eab'),
      completed: Id('71e7654f-2623-4794-88fb-841c8f3dd9b4'),
      assignees: Id('5b80d3ee-2463-4246-b628-44ba808ab3e1'),
    },
  },
);

export const JobOfferNew = EntityNew(
  {
    name: TypeNew.String,
    salary: TypeNew.Number,
  },
  {
    types: [Id('bffa181e-a333-495b-949c-57f2831d7eca')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      salary: Id('baa36ac9-78ac-4cf7-8394-6b2d3006bebe'),
    },
  },
);
