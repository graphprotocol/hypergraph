import { Entity, Type } from '@graphprotocol/hypergraph';

export class Address extends Entity.Class<Address>('Address')({
  name: Type.String,
  description: Type.String,
}) {}

export class Image extends Entity.Class<Image>('Image')({
  url: Type.String,
}) {}

export class Project extends Entity.Class<Project>('Project')({
  name: Type.String,
  description: Type.optional(Type.String),
  xUrl: Type.optional(Type.String),
  avatar: Type.Relation(Image),
}) {}

export class Dapp extends Entity.Class<Dapp>('Dapp')({
  name: Type.String,
}) {}

export class InvestmentRound extends Entity.Class<InvestmentRound>('InvestmentRound')({
  name: Type.String,
}) {}

export class Asset extends Entity.Class<Asset>('Asset')({
  name: Type.String,
}) {}
