/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Account = {
  __typename?: 'Account';
  /** Ethereum address of the account */
  address: Scalars['String']['output'];
  /** Account ID */
  id: Scalars['String']['output'];
};

export type AccountFilter = {
  address?: InputMaybe<Scalars['String']['input']>;
  addressIn?: InputMaybe<Array<Scalars['String']['input']>>;
  addressNot?: InputMaybe<Scalars['String']['input']>;
  addressNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
  id?: InputMaybe<Scalars['String']['input']>;
  idIn?: InputMaybe<Array<Scalars['String']['input']>>;
  idNot?: InputMaybe<Scalars['String']['input']>;
  idNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type AttributeFilter = {
  valueType?: InputMaybe<ValueType>;
};

/** Entity object */
export type Entity = {
  __typename?: 'Entity';
  /** Attributes of the entity */
  attributes: Array<Triple>;
  /** Entity blocks (if available) */
  blocks: Array<Entity>;
  /** Entity cover (if available) */
  cover?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  createdAtBlock: Scalars['String']['output'];
  /** Entity description (if available) */
  description?: Maybe<Scalars['String']['output']>;
  /** Entity ID */
  id: Scalars['String']['output'];
  /** Entity name (if available) */
  name?: Maybe<Scalars['String']['output']>;
  /** Relations outgoing from the entity */
  relations: Array<Relation>;
  /** The space ID of the entity (note: the same entity can exist in multiple spaces) */
  spaceId: Scalars['String']['output'];
  /** Types of the entity (which are entities themselves) */
  types: Array<Entity>;
  updatedAt: Scalars['String']['output'];
  updatedAtBlock: Scalars['String']['output'];
  /** Versions of the entity, ordered chronologically */
  versions: Array<EntityVersion>;
};


/** Entity object */
export type EntityAttributesArgs = {
  filter?: InputMaybe<AttributeFilter>;
};


/** Entity object */
export type EntityRelationsArgs = {
  where?: InputMaybe<EntityRelationFilter>;
};

/** Filter the entities by attributes and their values and value types */
export type EntityAttributeFilter = {
  attribute: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
  valueIn?: InputMaybe<Array<Scalars['String']['input']>>;
  valueNot?: InputMaybe<Scalars['String']['input']>;
  valueNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
  valueType?: InputMaybe<ValueType>;
  valueTypeIn?: InputMaybe<Array<ValueType>>;
  valueTypeNot?: InputMaybe<ValueType>;
  valueTypeNotIn?: InputMaybe<Array<ValueType>>;
};

/**
 * Entity filter input object
 *
 * ```graphql
 * query {
 *     entities(where: {
 *         space_id: "BJqiLPcSgfF8FRxkFr76Uy",
 *         types_contain: ["XG26vy98XAA6cR6DosTALk", "XG26vy98XAA6cR6DosTALk"],
 *         attributes_contain: [
 *             {id: "XG26vy98XAA6cR6DosTALk", value: "value", value_type: TEXT},
 *         ]
 *     })
 * }
 * ```
 */
export type EntityFilter = {
  attributes?: InputMaybe<Array<EntityAttributeFilter>>;
  id?: InputMaybe<Scalars['String']['input']>;
  idIn?: InputMaybe<Array<Scalars['String']['input']>>;
  idNot?: InputMaybe<Scalars['String']['input']>;
  idNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Exact match for the entity types */
  typesContains?: InputMaybe<Array<Scalars['String']['input']>>;
  typesNotContains?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Filters the outgoing relations of the entity */
export type EntityRelationFilter = {
  id?: InputMaybe<Scalars['String']['input']>;
  idIn?: InputMaybe<Array<Scalars['String']['input']>>;
  idNot?: InputMaybe<Scalars['String']['input']>;
  idNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
  relationType?: InputMaybe<Scalars['String']['input']>;
  relationTypeIn?: InputMaybe<Array<Scalars['String']['input']>>;
  relationTypeNot?: InputMaybe<Scalars['String']['input']>;
  relationTypeNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Filter the relations by the entity they point to */
  to?: InputMaybe<EntityFilter>;
  toId?: InputMaybe<Scalars['String']['input']>;
  toIdIn?: InputMaybe<Array<Scalars['String']['input']>>;
  toIdNot?: InputMaybe<Scalars['String']['input']>;
  toIdNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type EntityVersion = {
  __typename?: 'EntityVersion';
  /** Attributes of the entity */
  attributes: Array<Triple>;
  id: Scalars['String']['output'];
};


export type EntityVersionAttributesArgs = {
  filter?: InputMaybe<AttributeFilter>;
};

export type Options = {
  __typename?: 'Options';
  format?: Maybe<Scalars['String']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  unit?: Maybe<Scalars['String']['output']>;
};

export type OrderDirection =
  | 'ASC'
  | 'DESC';

export type Property = {
  __typename?: 'Property';
  /** Attributes of the entity */
  attributes: Array<Triple>;
  /** Entity blocks (if available) */
  blocks: Array<Entity>;
  /** Entity cover (if available) */
  cover?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  createdAtBlock: Scalars['String']['output'];
  /** Entity description (if available) */
  description?: Maybe<Scalars['String']['output']>;
  /** Entity ID */
  id: Scalars['String']['output'];
  /** Entity name (if available) */
  name?: Maybe<Scalars['String']['output']>;
  /** Value type of the property */
  relationValueType?: Maybe<Entity>;
  /** Relations outgoing from the entity */
  relations: Array<Relation>;
  /** The space ID of the entity (note: the same entity can exist in multiple spaces) */
  spaceId: Scalars['String']['output'];
  /** Types of the entity (which are entities themselves) */
  types: Array<Entity>;
  updatedAt: Scalars['String']['output'];
  updatedAtBlock: Scalars['String']['output'];
  /** Value type of the property */
  valueType?: Maybe<Entity>;
  /** Versions of the entity, ordered chronologically */
  versions: Array<EntityVersion>;
};


export type PropertyAttributesArgs = {
  filter?: InputMaybe<AttributeFilter>;
};


export type PropertyNameArgs = {
  strict?: Scalars['Boolean']['input'];
};


export type PropertyRelationsArgs = {
  where?: InputMaybe<EntityRelationFilter>;
};

/** Relation object */
export type Relation = {
  __typename?: 'Relation';
  /** Entity of the relation */
  entity: Entity;
  /** Entity from which the relation originates */
  from: Entity;
  /** Relation ID */
  id: Scalars['String']['output'];
  /** Relation type of the relation */
  relationType: Entity;
  /** Entity to which the relation points */
  to: Entity;
};

/** Relation filter input object */
export type RelationFilter = {
  /** Filter the relations by their attributes */
  attributes?: InputMaybe<Array<EntityAttributeFilter>>;
  /** Filter the relations by the entity they point from */
  from?: InputMaybe<EntityFilter>;
  /** Filter the relations by their id */
  id?: InputMaybe<Scalars['String']['input']>;
  idIn?: InputMaybe<Array<Scalars['String']['input']>>;
  idNot?: InputMaybe<Scalars['String']['input']>;
  idNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Filter the relations by their relation type */
  relationType?: InputMaybe<Scalars['String']['input']>;
  relationTypeIn?: InputMaybe<Array<Scalars['String']['input']>>;
  relationTypeNot?: InputMaybe<Scalars['String']['input']>;
  relationTypeNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Filter the relations by the entity they point to */
  to?: InputMaybe<EntityFilter>;
};

export type RootQuery = {
  __typename?: 'RootQuery';
  /** Returns a single account by ID */
  account?: Maybe<Account>;
  /** Returns a single account by address */
  accountByAddress?: Maybe<Account>;
  /** Returns multiple accounts according to the provided filter */
  accounts: Array<Account>;
  /** Returns multiple entities according to the provided space ID and filter */
  entities: Array<Entity>;
  /** Returns a single entity identified by its ID and space ID */
  entity?: Maybe<Entity>;
  /** Returns a single relation identified by its ID and space ID */
  relation?: Maybe<Relation>;
  /** Returns multiple relations according to the provided space ID and filter */
  relations: Array<Relation>;
  /** Returns a single space by ID */
  space?: Maybe<Space>;
  /** Returns multiple spaces according to the provided filter */
  spaces: Array<Space>;
  /**
   * Returns a single triple identified by its entity ID, attribute ID, space ID and
   * optional version ID
   */
  triple?: Maybe<Triple>;
};


export type RootQueryAccountArgs = {
  id: Scalars['String']['input'];
};


export type RootQueryAccountByAddressArgs = {
  address: Scalars['String']['input'];
};


export type RootQueryAccountsArgs = {
  first?: Scalars['Int']['input'];
  skip?: Scalars['Int']['input'];
  where?: InputMaybe<AccountFilter>;
};


export type RootQueryEntitiesArgs = {
  first?: Scalars['Int']['input'];
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: Scalars['Int']['input'];
  spaceId: Scalars['String']['input'];
  strict?: Scalars['Boolean']['input'];
  where?: InputMaybe<EntityFilter>;
};


export type RootQueryEntityArgs = {
  id: Scalars['String']['input'];
  spaceId: Scalars['String']['input'];
  strict?: Scalars['Boolean']['input'];
  versionId?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryRelationArgs = {
  id: Scalars['String']['input'];
  spaceId: Scalars['String']['input'];
  strict?: Scalars['Boolean']['input'];
  versionId?: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryRelationsArgs = {
  first?: Scalars['Int']['input'];
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: Scalars['Int']['input'];
  spaceId: Scalars['String']['input'];
  strict?: Scalars['Boolean']['input'];
  where?: InputMaybe<RelationFilter>;
};


export type RootQuerySpaceArgs = {
  id: Scalars['String']['input'];
  version?: InputMaybe<Scalars['String']['input']>;
};


export type RootQuerySpacesArgs = {
  first?: Scalars['Int']['input'];
  skip?: Scalars['Int']['input'];
  version?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<SpaceFilter>;
};


export type RootQueryTripleArgs = {
  attributeId: Scalars['String']['input'];
  entityId: Scalars['String']['input'];
  spaceId: Scalars['String']['input'];
  strict?: Scalars['Boolean']['input'];
  versionId?: InputMaybe<Scalars['String']['input']>;
};

/** SchemaType object */
export type SchemaType = {
  __typename?: 'SchemaType';
  /** Attributes of the entity */
  attributes: Array<Triple>;
  /** Entity blocks (if available) */
  blocks: Array<Entity>;
  /** Entity cover (if available) */
  cover?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  createdAtBlock: Scalars['String']['output'];
  /** Entity description (if available) */
  description?: Maybe<Scalars['String']['output']>;
  /** Entity ID */
  id: Scalars['String']['output'];
  /** Entity name (if available) */
  name?: Maybe<Scalars['String']['output']>;
  /** Properties of the Type */
  properties: Array<Property>;
  /** Relations outgoing from the entity */
  relations: Array<Relation>;
  /** The space ID of the entity (note: the same entity can exist in multiple spaces) */
  spaceId: Scalars['String']['output'];
  /** Types of the entity (which are entities themselves) */
  types: Array<Entity>;
  updatedAt: Scalars['String']['output'];
  updatedAtBlock: Scalars['String']['output'];
  /** Versions of the entity, ordered chronologically */
  versions: Array<EntityVersion>;
};


/** SchemaType object */
export type SchemaTypeAttributesArgs = {
  filter?: InputMaybe<AttributeFilter>;
};


/** SchemaType object */
export type SchemaTypeNameArgs = {
  strict?: Scalars['Boolean']['input'];
};


/** SchemaType object */
export type SchemaTypePropertiesArgs = {
  first?: Scalars['Int']['input'];
  skip?: Scalars['Int']['input'];
};


/** SchemaType object */
export type SchemaTypeRelationsArgs = {
  where?: InputMaybe<EntityRelationFilter>;
};

export type Space = {
  __typename?: 'Space';
  /** DAO contract address of the space */
  daoContractAddress: Scalars['String']['output'];
  /** Editors of the space */
  editors: Array<Account>;
  entities: Array<Entity>;
  /** Governance type of the space (Public or Personal) */
  governanceType: SpaceGovernanceType;
  /** Space ID */
  id: Scalars['String']['output'];
  /** Member access plugin address (if available) */
  memberAccessPlugin?: Maybe<Scalars['String']['output']>;
  /** Members of the space */
  members: Array<Account>;
  /** Network of the space */
  network: Scalars['String']['output'];
  /** Parent spaces of this space */
  parentSpaces: Array<Space>;
  /** Personal space admin plugin address (if available) */
  personalSpaceAdminPlugin?: Maybe<Scalars['String']['output']>;
  /** Space plugin address (if available) */
  spacePluginAddress?: Maybe<Scalars['String']['output']>;
  /** Subspaces of this space */
  subspaces: Array<Space>;
  type?: Maybe<SchemaType>;
  types: Array<SchemaType>;
  /** Voting plugin address (if available) */
  votingPluginAddress?: Maybe<Scalars['String']['output']>;
};


export type SpaceEditorsArgs = {
  first?: Scalars['Int']['input'];
  skip?: Scalars['Int']['input'];
};


export type SpaceEntitiesArgs = {
  first?: Scalars['Int']['input'];
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: Scalars['Int']['input'];
  strict?: Scalars['Boolean']['input'];
  where?: InputMaybe<EntityFilter>;
};


export type SpaceMembersArgs = {
  first?: Scalars['Int']['input'];
  skip?: Scalars['Int']['input'];
};


export type SpaceParentSpacesArgs = {
  first?: Scalars['Int']['input'];
  skip?: Scalars['Int']['input'];
};


export type SpaceSubspacesArgs = {
  first?: Scalars['Int']['input'];
  skip?: Scalars['Int']['input'];
};


export type SpaceTypeArgs = {
  id: Scalars['String']['input'];
  strict?: Scalars['Boolean']['input'];
};


export type SpaceTypesArgs = {
  first?: Scalars['Int']['input'];
  skip?: Scalars['Int']['input'];
  strict?: Scalars['Boolean']['input'];
};

export type SpaceFilter = {
  daoContractAddress?: InputMaybe<Scalars['String']['input']>;
  daoContractAddressIn?: InputMaybe<Array<Scalars['String']['input']>>;
  daoContractAddressNot?: InputMaybe<Scalars['String']['input']>;
  daoContractAddressNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
  governanceType?: InputMaybe<SpaceGovernanceType>;
  governanceTypeIn?: InputMaybe<Array<SpaceGovernanceType>>;
  governanceTypeNot?: InputMaybe<SpaceGovernanceType>;
  governanceTypeNotIn?: InputMaybe<Array<SpaceGovernanceType>>;
  id?: InputMaybe<Scalars['String']['input']>;
  idIn?: InputMaybe<Array<Scalars['String']['input']>>;
  idNot?: InputMaybe<Scalars['String']['input']>;
  idNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
  memberAccessPlugin?: InputMaybe<Scalars['String']['input']>;
  memberAccessPluginIn?: InputMaybe<Array<Scalars['String']['input']>>;
  memberAccessPluginNot?: InputMaybe<Scalars['String']['input']>;
  memberAccessPluginNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
  network?: InputMaybe<Scalars['String']['input']>;
  networkIn?: InputMaybe<Array<Scalars['String']['input']>>;
  networkNot?: InputMaybe<Scalars['String']['input']>;
  networkNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
  personalSpaceAdminPlugin?: InputMaybe<Scalars['String']['input']>;
  personalSpaceAdminPluginIn?: InputMaybe<Array<Scalars['String']['input']>>;
  personalSpaceAdminPluginNot?: InputMaybe<Scalars['String']['input']>;
  personalSpaceAdminPluginNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
  spacePluginAddress?: InputMaybe<Scalars['String']['input']>;
  spacePluginAddressIn?: InputMaybe<Array<Scalars['String']['input']>>;
  spacePluginAddressNot?: InputMaybe<Scalars['String']['input']>;
  spacePluginAddressNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
  votingPluginAddress?: InputMaybe<Scalars['String']['input']>;
  votingPluginAddressIn?: InputMaybe<Array<Scalars['String']['input']>>;
  votingPluginAddressNot?: InputMaybe<Scalars['String']['input']>;
  votingPluginAddressNotIn?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type SpaceGovernanceType =
  | 'PERSONAL'
  | 'PUBLIC';

export type Triple = {
  __typename?: 'Triple';
  /** Attribute ID of the triple */
  attribute: Scalars['String']['output'];
  /** Name of the attribute (if available) */
  name?: Maybe<Scalars['String']['output']>;
  /** Options of the triple (if any) */
  options: Options;
  /** Space ID of the triple */
  spaceId: Scalars['String']['output'];
  /** Value of the triple */
  value: Scalars['String']['output'];
  /** Value type of the triple */
  valueType: ValueType;
};

export type ValueType =
  | 'CHECKBOX'
  | 'NUMBER'
  | 'POINT'
  | 'TEXT'
  | 'TIME'
  | 'URL';

export type SchemaBrowserTypesQueryVariables = Exact<{
  spaceId: Scalars['String']['input'];
}>;


export type SchemaBrowserTypesQuery = { __typename?: 'RootQuery', space?: { __typename?: 'Space', types: Array<{ __typename?: 'SchemaType', id: string, name?: string | null, properties: Array<{ __typename?: 'Property', id: string, name?: string | null, valueType?: { __typename?: 'Entity', name?: string | null } | null, relationValueType?: { __typename?: 'Entity', name?: string | null } | null }> }> } | null };


export const SchemaBrowserTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SchemaBrowserTypes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"space"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"types"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"relationValueType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SchemaBrowserTypesQuery, SchemaBrowserTypesQueryVariables>;