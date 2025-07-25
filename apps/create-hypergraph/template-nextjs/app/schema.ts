import { Entity, Type } from '@graphprotocol/hypergraph';

export class Address extends Entity.Class<Address>('Address')({
  name: Type.Text,
  description: Type.Text,
}) {}

export class Project extends Entity.Class<Project>('Project')({
  name: Type.Text,
}) {}
