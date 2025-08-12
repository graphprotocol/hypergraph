import { Entity, Type } from '@graphprotocol/hypergraph';

export class User extends Entity.Class<User>('User')({
  name: Type.String,
  created: Type.Date
}) {}

export class Todo extends Entity.Class<Todo>('Todo')({
  name: Type.String,
  completed: Type.Boolean,
  assignees: Type.Relation(User)
}) {}

export class Todo2 extends Entity.Class<Todo2>('Todo2')({
  name: Type.String,
  checked: Type.Boolean,
  assignees: Type.Relation(User),
  due: Type.Date,
  amount: Type.Number,
  point: Type.Point,
  website: Type.String
}) {}

export class JobOffer extends Entity.Class<JobOffer>('JobOffer')({
  name: Type.String,
  salary: Type.Number
}) {}

export class Company extends Entity.Class<Company>('Company')({
  name: Type.String,
  jobOffers: Type.Relation(JobOffer)
}) {}

export class Event extends Entity.Class<Event>('Event')({
  name: Type.String,
  description: Type.optional(Type.String),
  sponsors: Type.Relation(Company),
  createdAt: Type.Date
}) {}