import { Id } from '@graphprotocol/grc-20';
import { Entity } from '@graphprotocol/hypergraph';
import type { Mapping } from '@graphprotocol/hypergraph-react';

export class User extends Entity.Class<User>('User')({
  id: Entity.Generated(Entity.Text),
  name: Entity.Text,
  __deleted: Entity.Generated(Entity.Checkbox),
  __version: Entity.Generated(Entity.Text),
  _relation: Entity.RelationObject,
}) {}

export class Todo extends Entity.Class<Todo>('Todo')({
  id: Entity.Generated(Entity.Text),
  name: Entity.Text,
  completed: Entity.Checkbox,
  assignees: Entity.Reference(Entity.ReferenceArray(User)),
  __deleted: Entity.Generated(Entity.Checkbox),
  __version: Entity.Generated(Entity.Text),
  _relation: Entity.RelationObject,
}) {}

export class Todo2 extends Entity.Class<Todo2>('Todo2')({
  id: Entity.Generated(Entity.Text),
  name: Entity.Text,
  checked: Entity.Checkbox,
  assignees: Entity.Reference(Entity.ReferenceArray(User)),
  __deleted: Entity.Generated(Entity.Checkbox),
  __version: Entity.Generated(Entity.Text),
  _relation: Entity.RelationObject,
}) {}

export class NewsStory extends Entity.Class<NewsStory>('NewsStory')({
  id: Entity.Generated(Entity.Text),
  name: Entity.Text,
  description: Entity.Text,
  publishDate: Entity.Text,
  __deleted: Entity.Generated(Entity.Checkbox),
  __version: Entity.Generated(Entity.Text),
  _relation: Entity.RelationObject,
}) {}

export const mapping: Mapping = {
  NewsStory: {
    typeIds: [Id.Id('VKPGYGnFuaoAASiAukCVCX')],
    properties: {
      name: Id.Id('LuBWqZAu6pz54eiJS5mLv8'),
      publishDate: Id.Id('KPNjGaLx5dKofVhT6Dfw22'),
      description: Id.Id('LA1DqP5v6QAdsgLPXGF3YA'),
    },
  },
  Todo2: {
    typeIds: [Id.Id('4ewpH1mPW9f2tLhaHdKKyn')],
    properties: {
      name: Id.Id('LuBWqZAu6pz54eiJS5mLv8'),
      checked: Id.Id('7zyFtwuuf9evFNZqcLSytU'),
    },
    relations: {
      assignees: Id.Id('GeLe54zpz1MiMWAF8LFCCt'),
    },
  },
  User: {
    typeIds: [Id.Id('KYCunro75we8KbjpsDKbm7')],
    properties: {
      name: Id.Id('LuBWqZAu6pz54eiJS5mLv8'),
    },
  },
};
