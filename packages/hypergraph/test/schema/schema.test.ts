import type { AnyDocumentId } from '@automerge/automerge-repo';
import { Repo } from '@automerge/automerge-repo';
import { beforeEach, describe, expect, it } from 'vitest';

import * as Schema from '../../src/Schema.js';
import { idToAutomergeId } from '../../src/utils/automergeId.js';

describe('Schema', () => {
  class Person extends Schema.Class<Person>('Person')({
    id: Schema.Generated(Schema.Text),
    name: Schema.Text,
    age: Schema.Number,
  }) {}

  class User extends Schema.Class<User>('User')({
    id: Schema.Generated(Schema.Text),
    name: Schema.Text,
    email: Schema.Text,
  }) {}

  class Badge extends Schema.Class<Badge>('Badge')({
    id: Schema.Generated(Schema.Text),
    name: Schema.Text,
  }) {}

  class Event extends Schema.Class<Event>('Event')({
    id: Schema.Generated(Schema.Text),
    name: Schema.Text,
  }) {}

  const spaceId = '52gTkePWSoGdXmgZF3nRU';
  let repo = new Repo({});
  let service = Schema.buildHypergraphSpaceEntitiesService({
    repo,
    spaceId,
  });

  beforeEach(() => {
    repo = new Repo({}); // reset to new Repo instance to clear created entities in tests
    const automergeDocHandle = repo.find(idToAutomergeId(spaceId) as AnyDocumentId);
    // set it to ready to interact with the document
    automergeDocHandle.doneLoading();

    service = Schema.buildHypergraphSpaceEntitiesService({
      repo,
      spaceId,
    });
  });

  describe('createEntity', () => {
    it('should create an entity in the repo and be discoverable by querying', () => {
      const created = service.createEntity(Event, { name: 'Conference' });
      expect(created).toEqual(expect.objectContaining({ type: Event.name, name: 'Conference' }));

      const id = created.id;
      expect(id).not.toBeNull();
      expect(id).not.toBeUndefined();

      const entities = service.findMany(Event);
      expect(entities).toHaveLength(1);
      expect(entities[0]).toEqual({ id, type: Event.name, name: 'Conference' });

      const found = service.findOne(Event, id);
      expect(found).not.toBeNull();
      expect(found).toEqual({ id, type: Event.name, name: 'Conference' });
    });
  });
  describe('updateEntity', () => {
    it('should update an existing entity and see the updates when querying', () => {
      const created = service.createEntity(Person, { name: 'Test', age: 1 });
      expect(created).toEqual(expect.objectContaining({ type: Person.name, name: 'Test', age: 1 }));

      const id = created.id;
      expect(id).not.toBeNull();
      expect(id).not.toBeUndefined();

      const entities = service.findMany(Person);
      expect(entities).toHaveLength(1);
      expect(entities[0]).toEqual({ id, type: Person.name, name: 'Test', age: 1 });

      const found = service.findOne(Person, id);
      expect(found).not.toBeNull();
      expect(found).toEqual({ id, type: Person.name, name: 'Test', age: 1 });

      // update the entity, validate we see the updates
      const updated = service.updateEntity(Person, id, { name: 'Test Updated', age: 2112 });
      expect(updated).toEqual({ id, type: Person.name, name: 'Test Updated', age: 2112 });

      const updatedEntities = service.findMany(Person);
      expect(updatedEntities).toHaveLength(1);
      expect(updatedEntities[0]).toEqual({ id, type: Person.name, name: 'Test Updated', age: 2112 });
      const foundUpdated = service.findOne(Person, id);
      expect(foundUpdated).not.toBeNull();
      expect(foundUpdated).toEqual({ id, type: Person.name, name: 'Test Updated', age: 2112 });
    });
    it('should throw an error if attempting to update an entity that does not exist in the repo', () => {
      expect(() => {
        service.updateEntity(Person, 'entity_dne', { name: 'does not exist' });
      }).toThrowError(Schema.EntityNotFoundError);
    });
  });
  describe('deleteEntity', () => {
    it('should be able to delete a created entity and no longer be found by querying', () => {
      const created = service.createEntity(User, { name: 'Test', email: 'test.user@thegraph.com' });
      expect(created).toEqual(
        expect.objectContaining({ type: User.name, name: 'Test', email: 'test.user@thegraph.com' }),
      );

      const id = created.id;
      expect(id).not.toBeNull();
      expect(id).not.toBeUndefined();

      const entities = service.findMany(User);
      expect(entities).toHaveLength(1);
      expect(entities[0]).toEqual({ id, type: User.name, name: 'Test', email: 'test.user@thegraph.com' });

      const found = service.findOne(User, id);
      expect(found).not.toBeNull();
      expect(found).toEqual({ id, type: User.name, name: 'Test', email: 'test.user@thegraph.com' });

      const deleted = service.deleteEntity(id);
      expect(deleted).toBe(true);

      expect(service.findMany(User)).toHaveLength(0);
      expect(service.findOne(User, id)).toBeNull();
    });
    it('should return false if no entity exists with the given id', () => {
      expect(service.deleteEntity('entity_dne')).toBe(false);
    });
  });
  describe('findMany', () => {
    it('should only query entities of the given type', () => {
      const createdUser = service.createEntity(User, { name: 'Test', email: 'test.user@thegraph.com' });
      expect(createdUser).toEqual(
        expect.objectContaining({ type: User.name, name: 'Test', email: 'test.user@thegraph.com' }),
      );
      const createdBadge = service.createEntity(Badge, { name: 'WeDidIt' });
      expect(createdBadge).toEqual(expect.objectContaining({ type: Badge.name, name: 'WeDidIt' }));

      // should only return users
      const users = service.findMany(User);
      expect(users).toHaveLength(1);
      for (const user of users) {
        expect(user.type).toEqual(User.name);
      }
      // should only return badges
      const badges = service.findMany(Badge);
      expect(badges).toHaveLength(1);
      for (const badge of badges) {
        expect(badge.type).toEqual(Badge.name);
      }
    });
    it('should be able to query for multiple entity types', () => {
      const createdUser = service.createEntity(User, { name: 'Test', email: 'test.user@thegraph.com' });
      expect(createdUser).toEqual(
        expect.objectContaining({ type: User.name, name: 'Test', email: 'test.user@thegraph.com' }),
      );
      const createdBadge = service.createEntity(Badge, { name: 'WeDidIt' });
      expect(createdBadge).toEqual(expect.objectContaining({ type: Badge.name, name: 'WeDidIt' }));

      const entities = service.findMany([User, Badge] as const);
      expect(entities).toHaveLength(2);
      const users = entities.filter((e) => e.type === User.name);
      expect(users).toHaveLength(1);
      const badges = entities.filter((e) => e.type === Badge.name);
      expect(badges).toHaveLength(1);
    });
    it('should throw an error if no types specified', () => {
      expect(() => {
        service.findMany([]);
      }).toThrowError(Schema.InvalidQueryMissingTypesError);
    });
  });
  describe('findOne', () => {
    it('should return null if not entity found', () => {
      expect(service.findOne(User, 'dne')).toBeNull();
    });
  });
});
