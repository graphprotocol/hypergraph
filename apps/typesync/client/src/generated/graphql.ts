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
  address: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  spacesWhereEdtitor?: Maybe<Array<Maybe<Space>>>;
  spacesWhereMember?: Maybe<Array<Maybe<Space>>>;
};

export type AddressFilter = {
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  is?: InputMaybe<Scalars['String']['input']>;
};

export type Block = {
  __typename?: 'Block';
  dataSourceType?: Maybe<DataSourceType>;
  entity?: Maybe<Entity>;
  id: Scalars['ID']['output'];
  type: BlockType;
  value?: Maybe<Scalars['String']['output']>;
};

export type BlockType =
  | 'DATA'
  | 'IMAGE'
  | 'TEXT';

export type CheckboxFilter = {
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  is?: InputMaybe<Scalars['Boolean']['input']>;
};

export type DataSourceType =
  | 'COLLECTION'
  | 'GEO'
  | 'QUERY';

export type DataType =
  | 'CHECKBOX'
  | 'NUMBER'
  | 'POINT'
  | 'RELATION'
  | 'TEXT'
  | 'TIME';

export type Entity = {
  __typename?: 'Entity';
  backlinks: Array<Maybe<Relation>>;
  blocks: Array<Maybe<Block>>;
  createdAt: Scalars['String']['output'];
  createdAtBlock: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  relations: Array<Maybe<Relation>>;
  spaces: Array<Maybe<Scalars['String']['output']>>;
  types: Array<Maybe<Entity>>;
  updatedAt: Scalars['String']['output'];
  updatedAtBlock: Scalars['String']['output'];
  values: Array<Maybe<Value>>;
};


export type EntityBacklinksArgs = {
  filter?: InputMaybe<RelationFilter>;
  spaceId?: InputMaybe<Scalars['String']['input']>;
};


export type EntityRelationsArgs = {
  filter?: InputMaybe<RelationFilter>;
  spaceId?: InputMaybe<Scalars['String']['input']>;
};


export type EntityValuesArgs = {
  filter?: InputMaybe<ValueFilter>;
  spaceId?: InputMaybe<Scalars['String']['input']>;
};

export type EntityFilter = {
  backlinks?: InputMaybe<RelationFilter>;
  id?: InputMaybe<IdFilter>;
  not?: InputMaybe<EntityFilter>;
  or?: InputMaybe<Array<EntityFilter>>;
  relations?: InputMaybe<RelationFilter>;
  types?: InputMaybe<IdFilter>;
  value?: InputMaybe<ValueFilter>;
};

export type IdFilter = {
  in?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Membership = {
  __typename?: 'Membership';
  address: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  space?: Maybe<Space>;
  spaceId: Scalars['String']['output'];
};

export type Meta = {
  __typename?: 'Meta';
  blockCursor?: Maybe<Scalars['String']['output']>;
  blockNumber?: Maybe<Scalars['String']['output']>;
};

export type NumberFilter = {
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  greaterThan?: InputMaybe<Scalars['Float']['input']>;
  greaterThanOrEqual?: InputMaybe<Scalars['Float']['input']>;
  is?: InputMaybe<Scalars['Float']['input']>;
  lessThan?: InputMaybe<Scalars['Float']['input']>;
  lessThanOrEqual?: InputMaybe<Scalars['Float']['input']>;
  not?: InputMaybe<NumberFilter>;
};

export type PointFilter = {
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  is?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
};

export type Property = {
  __typename?: 'Property';
  dataType: DataType;
  entity?: Maybe<Entity>;
  id: Scalars['ID']['output'];
  relationValueTypes?: Maybe<Array<Maybe<Type>>>;
  renderableType?: Maybe<Scalars['String']['output']>;
};

export type PropertyFilter = {
  dataType?: InputMaybe<DataType>;
  id?: InputMaybe<IdFilter>;
};

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  entities: Array<Maybe<Entity>>;
  entity?: Maybe<Entity>;
  meta?: Maybe<Meta>;
  properties: Array<Maybe<Property>>;
  property?: Maybe<Property>;
  relation?: Maybe<Relation>;
  relations: Array<Maybe<Relation>>;
  search: Array<Maybe<Entity>>;
  space?: Maybe<Space>;
  spaces: Array<Maybe<Space>>;
  types: Array<Maybe<Type>>;
};


export type QueryAccountArgs = {
  address: Scalars['String']['input'];
};


export type QueryEntitiesArgs = {
  filter?: InputMaybe<EntityFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  spaceId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEntityArgs = {
  id: Scalars['String']['input'];
  spaceId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPropertiesArgs = {
  filter?: InputMaybe<PropertyFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPropertyArgs = {
  id: Scalars['String']['input'];
};


export type QueryRelationArgs = {
  id: Scalars['String']['input'];
};


export type QueryRelationsArgs = {
  filter?: InputMaybe<RelationFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  spaceId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySearchArgs = {
  filter?: InputMaybe<SearchFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  spaceId?: InputMaybe<Scalars['String']['input']>;
  threshold?: InputMaybe<Scalars['Float']['input']>;
};


export type QuerySpaceArgs = {
  id: Scalars['String']['input'];
};


export type QuerySpacesArgs = {
  filter?: InputMaybe<SpaceFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTypesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  spaceId?: InputMaybe<Scalars['String']['input']>;
};

export type Relation = {
  __typename?: 'Relation';
  entityId: Scalars['ID']['output'];
  from?: Maybe<Entity>;
  fromId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  position?: Maybe<Scalars['String']['output']>;
  relationEntity?: Maybe<Entity>;
  spaceId: Scalars['String']['output'];
  to?: Maybe<Entity>;
  toId: Scalars['String']['output'];
  toSpaceId?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Property>;
  typeId: Scalars['String']['output'];
  verified?: Maybe<Scalars['Boolean']['output']>;
};

export type RelationFilter = {
  fromEntity?: InputMaybe<EntityFilter>;
  fromEntityId?: InputMaybe<Scalars['String']['input']>;
  relationEntity?: InputMaybe<EntityFilter>;
  relationEntityId?: InputMaybe<Scalars['String']['input']>;
  toEntity?: InputMaybe<EntityFilter>;
  toEntityId?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<IdFilter>;
  typeId?: InputMaybe<Scalars['String']['input']>;
};

export type SearchFilter = {
  not?: InputMaybe<SearchFilter>;
  or?: InputMaybe<Array<SearchFilter>>;
  types?: InputMaybe<IdFilter>;
};

export type Space = {
  __typename?: 'Space';
  daoAddress: Scalars['String']['output'];
  editors?: Maybe<Array<Membership>>;
  entity?: Maybe<Entity>;
  id: Scalars['ID']['output'];
  mainVotingAddress?: Maybe<Scalars['String']['output']>;
  members?: Maybe<Array<Membership>>;
  membershipAddress?: Maybe<Scalars['String']['output']>;
  personalAddress?: Maybe<Scalars['String']['output']>;
  spaceAddress: Scalars['String']['output'];
  type: SpaceType;
};

export type SpaceFilter = {
  editor?: InputMaybe<AddressFilter>;
  id?: InputMaybe<IdFilter>;
  member?: InputMaybe<AddressFilter>;
};

export type SpaceType =
  | 'PERSONAL'
  | 'PUBLIC';

export type TextFilter = {
  contains?: InputMaybe<Scalars['String']['input']>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  is?: InputMaybe<Scalars['String']['input']>;
  not?: InputMaybe<TextFilter>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

export type Type = {
  __typename?: 'Type';
  description?: Maybe<Scalars['String']['output']>;
  entity?: Maybe<Entity>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  properties?: Maybe<Array<Maybe<Property>>>;
};

export type Value = {
  __typename?: 'Value';
  entity?: Maybe<Entity>;
  entityId: Scalars['String']['output'];
  format?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  language?: Maybe<Scalars['String']['output']>;
  property?: Maybe<Property>;
  propertyId: Scalars['String']['output'];
  spaceId: Scalars['String']['output'];
  timezone?: Maybe<Scalars['String']['output']>;
  unit?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export type ValueFilter = {
  checkbox?: InputMaybe<CheckboxFilter>;
  number?: InputMaybe<NumberFilter>;
  point?: InputMaybe<PointFilter>;
  property: Scalars['String']['input'];
  text?: InputMaybe<TextFilter>;
};

export type SchemaBrowserTypesQueryVariables = Exact<{
  spaceId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type SchemaBrowserTypesQuery = { __typename?: 'Query', types: Array<{ __typename?: 'Type', id: string, name?: string | null, properties?: Array<{ __typename?: 'Property', id: string, dataType: DataType, entity?: { __typename?: 'Entity', id: string, name?: string | null } | null, relationValueTypes?: Array<{ __typename?: 'Type', id: string, name?: string | null, description?: string | null, properties?: Array<{ __typename?: 'Property', id: string, dataType: DataType, entity?: { __typename?: 'Entity', id: string, name?: string | null } | null } | null> | null } | null> | null } | null> | null } | null> };

export type PropertiesQueryVariables = Exact<{ [key: string]: never; }>;


export type PropertiesQuery = { __typename?: 'Query', properties: Array<{ __typename?: 'Property', id: string, dataType: DataType, entity?: { __typename?: 'Entity', id: string, name?: string | null, description?: string | null } | null, relationValueTypes?: Array<{ __typename?: 'Type', id: string, name?: string | null, description?: string | null, properties?: Array<{ __typename?: 'Property', id: string, dataType: DataType, entity?: { __typename?: 'Entity', id: string, name?: string | null } | null } | null> | null } | null> | null } | null> };


export const SchemaBrowserTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SchemaBrowserTypes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"types"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataType"}},{"kind":"Field","name":{"kind":"Name","value":"entity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"relationValueTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataType"}},{"kind":"Field","name":{"kind":"Name","value":"entity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SchemaBrowserTypesQuery, SchemaBrowserTypesQueryVariables>;
export const PropertiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataType"}},{"kind":"Field","name":{"kind":"Name","value":"entity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"relationValueTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataType"}},{"kind":"Field","name":{"kind":"Name","value":"entity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<PropertiesQuery, PropertiesQueryVariables>;