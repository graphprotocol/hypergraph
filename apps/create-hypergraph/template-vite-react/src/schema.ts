import { Entity, Type } from '@graphprotocol/hypergraph';

export class Address extends Entity.Class<Address>('Address')({
  name: Type.String,
  description: Type.String,
}) {}

export class Project extends Entity.Class<Project>('Project')({
  name: Type.String,
}) {}
