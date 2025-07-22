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
  /** A location in a connection that can be used for resuming pagination. */
  Cursor: { input: any; output: any; }
  /** A universally unique identifier as defined by [RFC 4122](https://tools.ietf.org/html/rfc4122). */
  UUID: { input: string; output: string; }
};

export type DataTypes =
  | 'CHECKBOX'
  | 'NUMBER'
  | 'POINT'
  | 'RELATION'
  | 'TEXT'
  | 'TIME';

/** A filter to be used against DataTypes fields. All fields are combined with a logical ‘and.’ */
export type DataTypesFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<DataTypes>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<DataTypes>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<DataTypes>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<DataTypes>>;
  /** Equal to the specified value. */
  is?: InputMaybe<DataTypes>;
  /** Not equal to the specified value. */
  isNot?: InputMaybe<DataTypes>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<DataTypes>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<DataTypes>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<DataTypes>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<DataTypes>>;
};

export type Editor = Node & {
  __typename?: 'Editor';
  address: Scalars['String']['output'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  /** Reads a single `Space` that is related to this `Editor`. */
  space?: Maybe<Space>;
  spaceId: Scalars['UUID']['output'];
};

/** A condition to be used against `Editor` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type EditorCondition = {
  /** Checks for equality with the object’s `address` field. */
  address?: InputMaybe<Scalars['String']['input']>;
  /** Checks for equality with the object’s `spaceId` field. */
  spaceId?: InputMaybe<Scalars['UUID']['input']>;
};

/** A filter to be used against `Editor` object types. All fields are combined with a logical ‘and.’ */
export type EditorFilter = {
  /** Filter by the object’s `address` field. */
  address?: InputMaybe<StringFilter>;
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<EditorFilter>>;
  /** Negates the expression. */
  not?: InputMaybe<EditorFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<EditorFilter>>;
  /** Filter by the object’s `space` relation. */
  space?: InputMaybe<SpaceFilter>;
  /** Filter by the object’s `spaceId` field. */
  spaceId?: InputMaybe<UuidFilter>;
};

/** A connection to a list of `Editor` values. */
export type EditorsConnection = {
  __typename?: 'EditorsConnection';
  /** A list of edges which contains the `Editor` and cursor to aid in pagination. */
  edges: Array<EditorsEdge>;
  /** A list of `Editor` objects. */
  nodes: Array<Editor>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Editor` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
};

/** A `Editor` edge in the connection. */
export type EditorsEdge = {
  __typename?: 'EditorsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Editor` at the end of the edge. */
  node: Editor;
};

/** Methods to use when ordering `Editor`. */
export type EditorsOrderBy =
  | 'ADDRESS_ASC'
  | 'ADDRESS_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC'
  | 'SPACE_ID_ASC'
  | 'SPACE_ID_DESC';

/** A connection to a list of `Entity` values. */
export type EntitiesConnection = {
  __typename?: 'EntitiesConnection';
  /** A list of edges which contains the `Entity` and cursor to aid in pagination. */
  edges: Array<EntitiesEdge>;
  /** A list of `Entity` objects. */
  nodes: Array<Entity>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Entity` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
};

/** A `Entity` edge in the connection. */
export type EntitiesEdge = {
  __typename?: 'EntitiesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Entity` at the end of the edge. */
  node: Entity;
};

/** Methods to use when ordering `Entity`. */
export type EntitiesOrderBy =
  | 'ID_ASC'
  | 'ID_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC';

export type Entity = Node & {
  __typename?: 'Entity';
  /** Reads and enables pagination through a set of `Relation`. */
  backlinks: RelationsConnection;
  /** Reads and enables pagination through a set of `Relation`. */
  backlinksList: Array<Relation>;
  createdAt: Scalars['String']['output'];
  createdAtBlock: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  /** Reads and enables pagination through a set of `Property`. */
  properties?: Maybe<Array<Property>>;
  /** Reads and enables pagination through a set of `Property`. */
  propertiesConnection: PropertiesConnection;
  /** Reads and enables pagination through a set of `Relation`. */
  relations: RelationsConnection;
  /** Reads and enables pagination through a set of `Relation`. */
  relationsList: Array<Relation>;
  /** Reads and enables pagination through a set of `Relation`. */
  relationsWhereEntity: RelationsConnection;
  /** Reads and enables pagination through a set of `Relation`. */
  relationsWhereEntityList: Array<Relation>;
  spaceIds?: Maybe<Array<Maybe<Scalars['UUID']['output']>>>;
  /** Reads and enables pagination through a set of `Space`. */
  spacesIn?: Maybe<Array<Space>>;
  /** Reads and enables pagination through a set of `Space`. */
  spacesInConnection: SpacesConnection;
  typeIds?: Maybe<Array<Maybe<Scalars['UUID']['output']>>>;
  /** Reads and enables pagination through a set of `Entity`. */
  types?: Maybe<Array<Entity>>;
  /** Reads and enables pagination through a set of `Entity`. */
  typesConnection: EntitiesConnection;
  updatedAt: Scalars['String']['output'];
  updatedAtBlock: Scalars['String']['output'];
  /** Reads and enables pagination through a set of `Value`. */
  values: ValuesConnection;
  /** Reads and enables pagination through a set of `Value`. */
  valuesList: Array<Value>;
};


export type EntityBacklinksArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<RelationCondition>;
  filter?: InputMaybe<RelationFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RelationsOrderBy>>;
};


export type EntityBacklinksListArgs = {
  condition?: InputMaybe<RelationCondition>;
  filter?: InputMaybe<RelationFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RelationsOrderBy>>;
};


export type EntityPropertiesArgs = {
  filter?: InputMaybe<PropertyFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  spaceId?: InputMaybe<Scalars['UUID']['input']>;
};


export type EntityPropertiesConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<PropertyFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  spaceId?: InputMaybe<Scalars['UUID']['input']>;
};


export type EntityRelationsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<RelationCondition>;
  filter?: InputMaybe<RelationFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RelationsOrderBy>>;
};


export type EntityRelationsListArgs = {
  condition?: InputMaybe<RelationCondition>;
  filter?: InputMaybe<RelationFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RelationsOrderBy>>;
};


export type EntityRelationsWhereEntityArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<RelationCondition>;
  filter?: InputMaybe<RelationFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RelationsOrderBy>>;
};


export type EntityRelationsWhereEntityListArgs = {
  condition?: InputMaybe<RelationCondition>;
  filter?: InputMaybe<RelationFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RelationsOrderBy>>;
};


export type EntitySpacesInArgs = {
  filter?: InputMaybe<SpaceFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type EntitySpacesInConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<SpaceFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type EntityTypesArgs = {
  filter?: InputMaybe<EntityFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type EntityTypesConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EntityFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type EntityValuesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<ValueCondition>;
  filter?: InputMaybe<ValueFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ValuesOrderBy>>;
};


export type EntityValuesListArgs = {
  condition?: InputMaybe<ValueCondition>;
  filter?: InputMaybe<ValueFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ValuesOrderBy>>;
};

/** A condition to be used against `Entity` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type EntityCondition = {
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['UUID']['input']>;
};

/** A filter to be used against `Entity` object types. All fields are combined with a logical ‘and.’ */
export type EntityFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<EntityFilter>>;
  /** Filter by the object’s `backlinks` relation. */
  backlinks?: InputMaybe<EntityToManyRelationFilter>;
  /** Some related `backlinks` exist. */
  backlinksExist?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by the object’s `description` field. */
  description?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<UuidFilter>;
  /** Filter by the object’s `name` field. */
  name?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<EntityFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<EntityFilter>>;
  /** Filter by the object’s `relations` relation. */
  relations?: InputMaybe<EntityToManyRelationFilter>;
  /** Some related `relations` exist. */
  relationsExist?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by the object’s `relationsWhereEntity` relation. */
  relationsWhereEntity?: InputMaybe<EntityToManyRelationFilter>;
  /** Some related `relationsWhereEntity` exist. */
  relationsWhereEntityExist?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by the object’s `spaceIds` field. */
  spaceIds?: InputMaybe<UuidListFilter>;
  /** Filter by the object’s `typeIds` field. */
  typeIds?: InputMaybe<UuidListFilter>;
  /** Filter by the object’s `values` relation. */
  values?: InputMaybe<EntityToManyValueFilter>;
  /** Some related `values` exist. */
  valuesExist?: InputMaybe<Scalars['Boolean']['input']>;
};

/** A filter to be used against many `Relation` object types. All fields are combined with a logical ‘and.’ */
export type EntityToManyRelationFilter = {
  /** Every related `Relation` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<RelationFilter>;
  /** No related `Relation` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<RelationFilter>;
  /** Some related `Relation` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<RelationFilter>;
};

/** A filter to be used against many `Value` object types. All fields are combined with a logical ‘and.’ */
export type EntityToManyValueFilter = {
  /** Every related `Value` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<ValueFilter>;
  /** No related `Value` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<ValueFilter>;
  /** Some related `Value` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<ValueFilter>;
};

export type Member = Node & {
  __typename?: 'Member';
  address: Scalars['String']['output'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  /** Reads a single `Space` that is related to this `Member`. */
  space?: Maybe<Space>;
  spaceId: Scalars['UUID']['output'];
};

/** A condition to be used against `Member` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type MemberCondition = {
  /** Checks for equality with the object’s `address` field. */
  address?: InputMaybe<Scalars['String']['input']>;
  /** Checks for equality with the object’s `spaceId` field. */
  spaceId?: InputMaybe<Scalars['UUID']['input']>;
};

/** A filter to be used against `Member` object types. All fields are combined with a logical ‘and.’ */
export type MemberFilter = {
  /** Filter by the object’s `address` field. */
  address?: InputMaybe<StringFilter>;
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<MemberFilter>>;
  /** Negates the expression. */
  not?: InputMaybe<MemberFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<MemberFilter>>;
  /** Filter by the object’s `space` relation. */
  space?: InputMaybe<SpaceFilter>;
  /** Filter by the object’s `spaceId` field. */
  spaceId?: InputMaybe<UuidFilter>;
};

/** A connection to a list of `Member` values. */
export type MembersConnection = {
  __typename?: 'MembersConnection';
  /** A list of edges which contains the `Member` and cursor to aid in pagination. */
  edges: Array<MembersEdge>;
  /** A list of `Member` objects. */
  nodes: Array<Member>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Member` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
};

/** A `Member` edge in the connection. */
export type MembersEdge = {
  __typename?: 'MembersEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Member` at the end of the edge. */
  node: Member;
};

/** Methods to use when ordering `Member`. */
export type MembersOrderBy =
  | 'ADDRESS_ASC'
  | 'ADDRESS_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC'
  | 'SPACE_ID_ASC'
  | 'SPACE_ID_DESC';

export type Meta = Node & {
  __typename?: 'Meta';
  blockNumber: Scalars['String']['output'];
  cursor: Scalars['String']['output'];
  id: Scalars['String']['output'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
};

/** A condition to be used against `Meta` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type MetaCondition = {
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['String']['input']>;
};

/** A filter to be used against `Meta` object types. All fields are combined with a logical ‘and.’ */
export type MetaFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<MetaFilter>>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<MetaFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<MetaFilter>>;
};

/** A connection to a list of `Meta` values. */
export type MetasConnection = {
  __typename?: 'MetasConnection';
  /** A list of edges which contains the `Meta` and cursor to aid in pagination. */
  edges: Array<MetasEdge>;
  /** A list of `Meta` objects. */
  nodes: Array<Meta>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Meta` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
};

/** A `Meta` edge in the connection. */
export type MetasEdge = {
  __typename?: 'MetasEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Meta` at the end of the edge. */
  node: Meta;
};

/** Methods to use when ordering `Meta`. */
export type MetasOrderBy =
  | 'ID_ASC'
  | 'ID_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC';

/** An object with a globally unique `ID`. */
export type Node = {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['Cursor']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['Cursor']['output']>;
};

/** A connection to a list of `Property` values. */
export type PropertiesConnection = {
  __typename?: 'PropertiesConnection';
  /** A list of edges which contains the `Property` and cursor to aid in pagination. */
  edges: Array<PropertiesEdge>;
  /** A list of `Property` objects. */
  nodes: Array<Property>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Property` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
};

/** A `Property` edge in the connection. */
export type PropertiesEdge = {
  __typename?: 'PropertiesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Property` at the end of the edge. */
  node: Property;
};

/** Methods to use when ordering `Property`. */
export type PropertiesOrderBy =
  | 'DATA_TYPE_ASC'
  | 'DATA_TYPE_DESC'
  | 'ID_ASC'
  | 'ID_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC';

export type Property = Node & {
  __typename?: 'Property';
  dataType: DataTypes;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  relationValueTypeIds?: Maybe<Array<Maybe<Scalars['UUID']['output']>>>;
  /** Reads and enables pagination through a set of `Entity`. */
  relationValueTypes?: Maybe<Array<Entity>>;
  /** Reads and enables pagination through a set of `Entity`. */
  relationValueTypesConnection: EntitiesConnection;
  renderableType?: Maybe<Scalars['UUID']['output']>;
};


export type PropertyRelationValueTypesArgs = {
  filter?: InputMaybe<EntityFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type PropertyRelationValueTypesConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EntityFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

/**
 * A condition to be used against `Property` object types. All fields are tested
 * for equality and combined with a logical ‘and.’
 */
export type PropertyCondition = {
  /** Checks for equality with the object’s `dataType` field. */
  dataType?: InputMaybe<DataTypes>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['UUID']['input']>;
};

/** A filter to be used against `Property` object types. All fields are combined with a logical ‘and.’ */
export type PropertyFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<PropertyFilter>>;
  /** Filter by the object’s `dataType` field. */
  dataType?: InputMaybe<DataTypesFilter>;
  /** Filter by the object’s `description` field. */
  description?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<UuidFilter>;
  /** Filter by the object’s `name` field. */
  name?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<PropertyFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<PropertyFilter>>;
  /** Filter by the object’s `relationValueTypeIds` field. */
  relationValueTypeIds?: InputMaybe<UuidListFilter>;
  /** Filter by the object’s `relationsByTypeIdConnection` relation. */
  relationsByTypeIdConnection?: InputMaybe<PropertyToManyRelationFilter>;
  /** Some related `relationsByTypeIdConnection` exist. */
  relationsByTypeIdConnectionExist?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by the object’s `renderableType` field. */
  renderableType?: InputMaybe<UuidFilter>;
  /** Filter by the object’s `valuesConnection` relation. */
  valuesConnection?: InputMaybe<PropertyToManyValueFilter>;
  /** Some related `valuesConnection` exist. */
  valuesConnectionExist?: InputMaybe<Scalars['Boolean']['input']>;
};

/** A filter to be used against many `Relation` object types. All fields are combined with a logical ‘and.’ */
export type PropertyToManyRelationFilter = {
  /** Every related `Relation` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<RelationFilter>;
  /** No related `Relation` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<RelationFilter>;
  /** Some related `Relation` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<RelationFilter>;
};

/** A filter to be used against many `Value` object types. All fields are combined with a logical ‘and.’ */
export type PropertyToManyValueFilter = {
  /** Every related `Value` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<ValueFilter>;
  /** No related `Value` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<ValueFilter>;
  /** Some related `Value` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<ValueFilter>;
};

/** The root query type which gives access points into the data universe. */
export type Query = Node & {
  __typename?: 'Query';
  /** Reads a single `Editor` using its globally unique `ID`. */
  editorByNodeId?: Maybe<Editor>;
  /** Reads a set of `Editor`. */
  editors?: Maybe<Array<Editor>>;
  /** Reads and enables pagination through a set of `Editor`. */
  editorsConnection?: Maybe<EditorsConnection>;
  /** Reads a set of `Entity`. */
  entities?: Maybe<Array<Entity>>;
  /** Reads and enables pagination through a set of `Entity`. */
  entitiesConnection?: Maybe<EntitiesConnection>;
  entity?: Maybe<Entity>;
  /** Reads a single `Entity` using its globally unique `ID`. */
  entityByNodeId?: Maybe<Entity>;
  /** Reads a single `Member` using its globally unique `ID`. */
  memberByNodeId?: Maybe<Member>;
  /** Reads a set of `Member`. */
  members?: Maybe<Array<Member>>;
  /** Reads and enables pagination through a set of `Member`. */
  membersConnection?: Maybe<MembersConnection>;
  meta?: Maybe<Meta>;
  /** Reads a single `Meta` using its globally unique `ID`. */
  metaByNodeId?: Maybe<Meta>;
  /** Reads a set of `Meta`. */
  metas?: Maybe<Array<Meta>>;
  /** Reads and enables pagination through a set of `Meta`. */
  metasConnection?: Maybe<MetasConnection>;
  /** Fetches an object given its globally unique `ID`. */
  node?: Maybe<Node>;
  /** The root query type must be a `Node` to work well with Relay 1 mutations. This just resolves to `query`. */
  nodeId: Scalars['ID']['output'];
  /** Reads a set of `Property`. */
  properties?: Maybe<Array<Property>>;
  /** Reads and enables pagination through a set of `Property`. */
  propertiesConnection?: Maybe<PropertiesConnection>;
  property?: Maybe<Property>;
  /** Reads a single `Property` using its globally unique `ID`. */
  propertyByNodeId?: Maybe<Property>;
  /**
   * Exposes the root query type nested one level down. This is helpful for Relay 1
   * which can only query top level fields if they are in a particular form.
   */
  query: Query;
  relation?: Maybe<Relation>;
  /** Reads a single `Relation` using its globally unique `ID`. */
  relationByNodeId?: Maybe<Relation>;
  /** Reads a set of `Relation`. */
  relations?: Maybe<Array<Relation>>;
  /** Reads and enables pagination through a set of `Relation`. */
  relationsConnection?: Maybe<RelationsConnection>;
  /** Reads and enables pagination through a set of `Entity`. */
  search?: Maybe<Array<Entity>>;
  /** Reads and enables pagination through a set of `Entity`. */
  searchConnection?: Maybe<EntitiesConnection>;
  space?: Maybe<Space>;
  /** Reads a single `Space` using its globally unique `ID`. */
  spaceByNodeId?: Maybe<Space>;
  /** Reads a set of `Space`. */
  spaces?: Maybe<Array<Space>>;
  /** Reads and enables pagination through a set of `Space`. */
  spacesConnection?: Maybe<SpacesConnection>;
  type?: Maybe<Entity>;
  /** Reads and enables pagination through a set of `Entity`. */
  typesList?: Maybe<Array<Entity>>;
  /** Reads and enables pagination through a set of `Entity`. */
  typesListConnection?: Maybe<EntitiesConnection>;
  value?: Maybe<Value>;
  /** Reads a single `Value` using its globally unique `ID`. */
  valueByNodeId?: Maybe<Value>;
  /** Reads a set of `Value`. */
  values?: Maybe<Array<Value>>;
  /** Reads and enables pagination through a set of `Value`. */
  valuesConnection?: Maybe<ValuesConnection>;
};


/** The root query type which gives access points into the data universe. */
export type QueryEditorByNodeIdArgs = {
  nodeId: Scalars['ID']['input'];
};


/** The root query type which gives access points into the data universe. */
export type QueryEditorsArgs = {
  condition?: InputMaybe<EditorCondition>;
  filter?: InputMaybe<EditorFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EditorsOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryEditorsConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<EditorCondition>;
  filter?: InputMaybe<EditorFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EditorsOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryEntitiesArgs = {
  condition?: InputMaybe<EntityCondition>;
  filter?: InputMaybe<EntityFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EntitiesOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryEntitiesConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<EntityCondition>;
  filter?: InputMaybe<EntityFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EntitiesOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryEntityArgs = {
  id: Scalars['UUID']['input'];
};


/** The root query type which gives access points into the data universe. */
export type QueryEntityByNodeIdArgs = {
  nodeId: Scalars['ID']['input'];
};


/** The root query type which gives access points into the data universe. */
export type QueryMemberByNodeIdArgs = {
  nodeId: Scalars['ID']['input'];
};


/** The root query type which gives access points into the data universe. */
export type QueryMembersArgs = {
  condition?: InputMaybe<MemberCondition>;
  filter?: InputMaybe<MemberFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MembersOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryMembersConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<MemberCondition>;
  filter?: InputMaybe<MemberFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MembersOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryMetaArgs = {
  id: Scalars['String']['input'];
};


/** The root query type which gives access points into the data universe. */
export type QueryMetaByNodeIdArgs = {
  nodeId: Scalars['ID']['input'];
};


/** The root query type which gives access points into the data universe. */
export type QueryMetasArgs = {
  condition?: InputMaybe<MetaCondition>;
  filter?: InputMaybe<MetaFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MetasOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryMetasConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<MetaCondition>;
  filter?: InputMaybe<MetaFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MetasOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryNodeArgs = {
  nodeId: Scalars['ID']['input'];
};


/** The root query type which gives access points into the data universe. */
export type QueryPropertiesArgs = {
  condition?: InputMaybe<PropertyCondition>;
  filter?: InputMaybe<PropertyFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<PropertiesOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryPropertiesConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<PropertyCondition>;
  filter?: InputMaybe<PropertyFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<PropertiesOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryPropertyArgs = {
  id: Scalars['UUID']['input'];
};


/** The root query type which gives access points into the data universe. */
export type QueryPropertyByNodeIdArgs = {
  nodeId: Scalars['ID']['input'];
};


/** The root query type which gives access points into the data universe. */
export type QueryRelationArgs = {
  id: Scalars['UUID']['input'];
};


/** The root query type which gives access points into the data universe. */
export type QueryRelationByNodeIdArgs = {
  nodeId: Scalars['ID']['input'];
};


/** The root query type which gives access points into the data universe. */
export type QueryRelationsArgs = {
  condition?: InputMaybe<RelationCondition>;
  filter?: InputMaybe<RelationFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RelationsOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryRelationsConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<RelationCondition>;
  filter?: InputMaybe<RelationFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RelationsOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QuerySearchArgs = {
  filter?: InputMaybe<EntityFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  similarityThreshold?: InputMaybe<Scalars['Float']['input']>;
  spaceId?: InputMaybe<Scalars['UUID']['input']>;
};


/** The root query type which gives access points into the data universe. */
export type QuerySearchConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EntityFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  similarityThreshold?: InputMaybe<Scalars['Float']['input']>;
  spaceId?: InputMaybe<Scalars['UUID']['input']>;
};


/** The root query type which gives access points into the data universe. */
export type QuerySpaceArgs = {
  id: Scalars['UUID']['input'];
};


/** The root query type which gives access points into the data universe. */
export type QuerySpaceByNodeIdArgs = {
  nodeId: Scalars['ID']['input'];
};


/** The root query type which gives access points into the data universe. */
export type QuerySpacesArgs = {
  condition?: InputMaybe<SpaceCondition>;
  filter?: InputMaybe<SpaceFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<SpacesOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QuerySpacesConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<SpaceCondition>;
  filter?: InputMaybe<SpaceFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<SpacesOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryTypeArgs = {
  id?: InputMaybe<Scalars['UUID']['input']>;
};


/** The root query type which gives access points into the data universe. */
export type QueryTypesListArgs = {
  filter?: InputMaybe<EntityFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  spaceId?: InputMaybe<Scalars['UUID']['input']>;
};


/** The root query type which gives access points into the data universe. */
export type QueryTypesListConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EntityFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  spaceId?: InputMaybe<Scalars['UUID']['input']>;
};


/** The root query type which gives access points into the data universe. */
export type QueryValueArgs = {
  id: Scalars['String']['input'];
};


/** The root query type which gives access points into the data universe. */
export type QueryValueByNodeIdArgs = {
  nodeId: Scalars['ID']['input'];
};


/** The root query type which gives access points into the data universe. */
export type QueryValuesArgs = {
  condition?: InputMaybe<ValueCondition>;
  filter?: InputMaybe<ValueFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ValuesOrderBy>>;
};


/** The root query type which gives access points into the data universe. */
export type QueryValuesConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<ValueCondition>;
  filter?: InputMaybe<ValueFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ValuesOrderBy>>;
};

export type Relation = Node & {
  __typename?: 'Relation';
  /** Reads a single `Entity` that is related to this `Relation`. */
  entity?: Maybe<Entity>;
  entityId: Scalars['UUID']['output'];
  /** Reads a single `Entity` that is related to this `Relation`. */
  fromEntity?: Maybe<Entity>;
  fromEntityId: Scalars['UUID']['output'];
  fromSpaceId?: Maybe<Scalars['UUID']['output']>;
  fromVersionId?: Maybe<Scalars['UUID']['output']>;
  id: Scalars['UUID']['output'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  position?: Maybe<Scalars['String']['output']>;
  /** Reads a single `Space` that is related to this `Relation`. */
  space?: Maybe<Space>;
  spaceId: Scalars['UUID']['output'];
  /** Reads a single `Entity` that is related to this `Relation`. */
  toEntity?: Maybe<Entity>;
  toEntityId: Scalars['UUID']['output'];
  toSpaceId?: Maybe<Scalars['UUID']['output']>;
  toVersionId?: Maybe<Scalars['UUID']['output']>;
  /** Reads a single `Property` that is related to this `Relation`. */
  type?: Maybe<Property>;
  typeId: Scalars['UUID']['output'];
  verified?: Maybe<Scalars['Boolean']['output']>;
};

/**
 * A condition to be used against `Relation` object types. All fields are tested
 * for equality and combined with a logical ‘and.’
 */
export type RelationCondition = {
  /** Checks for equality with the object’s `entityId` field. */
  entityId?: InputMaybe<Scalars['UUID']['input']>;
  /** Checks for equality with the object’s `fromEntityId` field. */
  fromEntityId?: InputMaybe<Scalars['UUID']['input']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['UUID']['input']>;
  /** Checks for equality with the object’s `spaceId` field. */
  spaceId?: InputMaybe<Scalars['UUID']['input']>;
  /** Checks for equality with the object’s `toEntityId` field. */
  toEntityId?: InputMaybe<Scalars['UUID']['input']>;
  /** Checks for equality with the object’s `typeId` field. */
  typeId?: InputMaybe<Scalars['UUID']['input']>;
};

/** A filter to be used against `Relation` object types. All fields are combined with a logical ‘and.’ */
export type RelationFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<RelationFilter>>;
  /** Filter by the object’s `entity` relation. */
  entity?: InputMaybe<EntityFilter>;
  /** Filter by the object’s `entityId` field. */
  entityId?: InputMaybe<UuidFilter>;
  /** Filter by the object’s `fromEntity` relation. */
  fromEntity?: InputMaybe<EntityFilter>;
  /** Filter by the object’s `fromEntityId` field. */
  fromEntityId?: InputMaybe<UuidFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<UuidFilter>;
  /** Negates the expression. */
  not?: InputMaybe<RelationFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<RelationFilter>>;
  /** Filter by the object’s `space` relation. */
  space?: InputMaybe<SpaceFilter>;
  /** Filter by the object’s `spaceId` field. */
  spaceId?: InputMaybe<UuidFilter>;
  /** Filter by the object’s `toEntity` relation. */
  toEntity?: InputMaybe<EntityFilter>;
  /** Filter by the object’s `toEntityId` field. */
  toEntityId?: InputMaybe<UuidFilter>;
  /** Filter by the object’s `type` relation. */
  type?: InputMaybe<PropertyFilter>;
  /** Filter by the object’s `typeId` field. */
  typeId?: InputMaybe<UuidFilter>;
};

/** A connection to a list of `Relation` values. */
export type RelationsConnection = {
  __typename?: 'RelationsConnection';
  /** A list of edges which contains the `Relation` and cursor to aid in pagination. */
  edges: Array<RelationsEdge>;
  /** A list of `Relation` objects. */
  nodes: Array<Relation>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Relation` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
};

/** A `Relation` edge in the connection. */
export type RelationsEdge = {
  __typename?: 'RelationsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Relation` at the end of the edge. */
  node: Relation;
};

/** Methods to use when ordering `Relation`. */
export type RelationsOrderBy =
  | 'ENTITY_ID_ASC'
  | 'ENTITY_ID_DESC'
  | 'FROM_ENTITY_ID_ASC'
  | 'FROM_ENTITY_ID_DESC'
  | 'ID_ASC'
  | 'ID_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC'
  | 'SPACE_ID_ASC'
  | 'SPACE_ID_DESC'
  | 'TO_ENTITY_ID_ASC'
  | 'TO_ENTITY_ID_DESC'
  | 'TYPE_ID_ASC'
  | 'TYPE_ID_DESC';

export type Space = Node & {
  __typename?: 'Space';
  daoAddress: Scalars['String']['output'];
  /** Reads and enables pagination through a set of `Editor`. */
  editors: EditorsConnection;
  /** Reads and enables pagination through a set of `Editor`. */
  editorsList: Array<Editor>;
  id: Scalars['UUID']['output'];
  mainVotingAddress?: Maybe<Scalars['String']['output']>;
  /** Reads and enables pagination through a set of `Member`. */
  members: MembersConnection;
  /** Reads and enables pagination through a set of `Member`. */
  membersList: Array<Member>;
  membershipAddress?: Maybe<Scalars['String']['output']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  page?: Maybe<Entity>;
  personalAddress?: Maybe<Scalars['String']['output']>;
  /** Reads and enables pagination through a set of `Relation`. */
  relations: Array<Relation>;
  /** Reads and enables pagination through a set of `Relation`. */
  relationsConnection: RelationsConnection;
  spaceAddress: Scalars['String']['output'];
  type: SpaceTypes;
  /** Reads and enables pagination through a set of `Value`. */
  values: Array<Value>;
  /** Reads and enables pagination through a set of `Value`. */
  valuesConnection: ValuesConnection;
};


export type SpaceEditorsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<EditorCondition>;
  filter?: InputMaybe<EditorFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EditorsOrderBy>>;
};


export type SpaceEditorsListArgs = {
  condition?: InputMaybe<EditorCondition>;
  filter?: InputMaybe<EditorFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EditorsOrderBy>>;
};


export type SpaceMembersArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<MemberCondition>;
  filter?: InputMaybe<MemberFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MembersOrderBy>>;
};


export type SpaceMembersListArgs = {
  condition?: InputMaybe<MemberCondition>;
  filter?: InputMaybe<MemberFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MembersOrderBy>>;
};


export type SpaceRelationsArgs = {
  condition?: InputMaybe<RelationCondition>;
  filter?: InputMaybe<RelationFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RelationsOrderBy>>;
};


export type SpaceRelationsConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<RelationCondition>;
  filter?: InputMaybe<RelationFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RelationsOrderBy>>;
};


export type SpaceValuesArgs = {
  condition?: InputMaybe<ValueCondition>;
  filter?: InputMaybe<ValueFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ValuesOrderBy>>;
};


export type SpaceValuesConnectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<ValueCondition>;
  filter?: InputMaybe<ValueFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ValuesOrderBy>>;
};

/** A condition to be used against `Space` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type SpaceCondition = {
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['UUID']['input']>;
};

/** A filter to be used against `Space` object types. All fields are combined with a logical ‘and.’ */
export type SpaceFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<SpaceFilter>>;
  /** Filter by the object’s `editors` relation. */
  editors?: InputMaybe<SpaceToManyEditorFilter>;
  /** Some related `editors` exist. */
  editorsExist?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<UuidFilter>;
  /** Filter by the object’s `members` relation. */
  members?: InputMaybe<SpaceToManyMemberFilter>;
  /** Some related `members` exist. */
  membersExist?: InputMaybe<Scalars['Boolean']['input']>;
  /** Negates the expression. */
  not?: InputMaybe<SpaceFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<SpaceFilter>>;
  /** Filter by the object’s `relationsConnection` relation. */
  relationsConnection?: InputMaybe<SpaceToManyRelationFilter>;
  /** Some related `relationsConnection` exist. */
  relationsConnectionExist?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by the object’s `valuesConnection` relation. */
  valuesConnection?: InputMaybe<SpaceToManyValueFilter>;
  /** Some related `valuesConnection` exist. */
  valuesConnectionExist?: InputMaybe<Scalars['Boolean']['input']>;
};

/** A filter to be used against many `Editor` object types. All fields are combined with a logical ‘and.’ */
export type SpaceToManyEditorFilter = {
  /** Every related `Editor` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<EditorFilter>;
  /** No related `Editor` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<EditorFilter>;
  /** Some related `Editor` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<EditorFilter>;
};

/** A filter to be used against many `Member` object types. All fields are combined with a logical ‘and.’ */
export type SpaceToManyMemberFilter = {
  /** Every related `Member` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<MemberFilter>;
  /** No related `Member` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<MemberFilter>;
  /** Some related `Member` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<MemberFilter>;
};

/** A filter to be used against many `Relation` object types. All fields are combined with a logical ‘and.’ */
export type SpaceToManyRelationFilter = {
  /** Every related `Relation` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<RelationFilter>;
  /** No related `Relation` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<RelationFilter>;
  /** Some related `Relation` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<RelationFilter>;
};

/** A filter to be used against many `Value` object types. All fields are combined with a logical ‘and.’ */
export type SpaceToManyValueFilter = {
  /** Every related `Value` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<ValueFilter>;
  /** No related `Value` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<ValueFilter>;
  /** Some related `Value` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<ValueFilter>;
};

export type SpaceTypes =
  | 'PERSONAL'
  | 'PUBLIC';

/** A connection to a list of `Space` values. */
export type SpacesConnection = {
  __typename?: 'SpacesConnection';
  /** A list of edges which contains the `Space` and cursor to aid in pagination. */
  edges: Array<SpacesEdge>;
  /** A list of `Space` objects. */
  nodes: Array<Space>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Space` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
};

/** A `Space` edge in the connection. */
export type SpacesEdge = {
  __typename?: 'SpacesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Space` at the end of the edge. */
  node: Space;
};

/** Methods to use when ordering `Space`. */
export type SpacesOrderBy =
  | 'ID_ASC'
  | 'ID_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC';

/** A filter to be used against String fields. All fields are combined with a logical ‘and.’ */
export type StringFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['String']['input']>;
  /** Not equal to the specified value, treating null like an ordinary value (case-insensitive). */
  distinctFromInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Ends with the specified string (case-sensitive). */
  endsWith?: InputMaybe<Scalars['String']['input']>;
  /** Ends with the specified string (case-insensitive). */
  endsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['String']['input']>;
  /** Greater than the specified value (case-insensitive). */
  greaterThanInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['String']['input']>;
  /** Greater than or equal to the specified value (case-insensitive). */
  greaterThanOrEqualToInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Included in the specified list (case-insensitive). */
  inInsensitive?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Contains the specified string (case-sensitive). */
  includes?: InputMaybe<Scalars['String']['input']>;
  /** Contains the specified string (case-insensitive). */
  includesInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Equal to the specified value. */
  is?: InputMaybe<Scalars['String']['input']>;
  /** Equal to the specified value (case-insensitive). */
  isInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Not equal to the specified value. */
  isNot?: InputMaybe<Scalars['String']['input']>;
  /** Not equal to the specified value (case-insensitive). */
  isNotInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['String']['input']>;
  /** Less than the specified value (case-insensitive). */
  lessThanInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['String']['input']>;
  /** Less than or equal to the specified value (case-insensitive). */
  lessThanOrEqualToInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Matches the specified pattern (case-sensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  like?: InputMaybe<Scalars['String']['input']>;
  /** Matches the specified pattern (case-insensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  likeInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['String']['input']>;
  /** Equal to the specified value, treating null like an ordinary value (case-insensitive). */
  notDistinctFromInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Does not end with the specified string (case-sensitive). */
  notEndsWith?: InputMaybe<Scalars['String']['input']>;
  /** Does not end with the specified string (case-insensitive). */
  notEndsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Not included in the specified list (case-insensitive). */
  notInInsensitive?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Does not contain the specified string (case-sensitive). */
  notIncludes?: InputMaybe<Scalars['String']['input']>;
  /** Does not contain the specified string (case-insensitive). */
  notIncludesInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Does not match the specified pattern (case-sensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  notLike?: InputMaybe<Scalars['String']['input']>;
  /** Does not match the specified pattern (case-insensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  notLikeInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Does not start with the specified string (case-sensitive). */
  notStartsWith?: InputMaybe<Scalars['String']['input']>;
  /** Does not start with the specified string (case-insensitive). */
  notStartsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  /** Starts with the specified string (case-sensitive). */
  startsWith?: InputMaybe<Scalars['String']['input']>;
  /** Starts with the specified string (case-insensitive). */
  startsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
};

/** A filter to be used against UUID fields. All fields are combined with a logical ‘and.’ */
export type UuidFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['UUID']['input']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['UUID']['input']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['UUID']['input']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Equal to the specified value. */
  is?: InputMaybe<Scalars['UUID']['input']>;
  /** Not equal to the specified value. */
  isNot?: InputMaybe<Scalars['UUID']['input']>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['UUID']['input']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['UUID']['input']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['UUID']['input']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** A filter to be used against UUID List fields. All fields are combined with a logical ‘and.’ */
export type UuidListFilter = {
  /** Any array item is equal to the specified value. */
  anyEqualTo?: InputMaybe<Scalars['UUID']['input']>;
  /** Any array item is greater than the specified value. */
  anyGreaterThan?: InputMaybe<Scalars['UUID']['input']>;
  /** Any array item is greater than or equal to the specified value. */
  anyGreaterThanOrEqualTo?: InputMaybe<Scalars['UUID']['input']>;
  /** Any array item is less than the specified value. */
  anyLessThan?: InputMaybe<Scalars['UUID']['input']>;
  /** Any array item is less than or equal to the specified value. */
  anyLessThanOrEqualTo?: InputMaybe<Scalars['UUID']['input']>;
  /** Any array item is not equal to the specified value. */
  anyNotEqualTo?: InputMaybe<Scalars['UUID']['input']>;
  /** Contained by the specified list of values. */
  containedBy?: InputMaybe<Array<InputMaybe<Scalars['UUID']['input']>>>;
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Array<InputMaybe<Scalars['UUID']['input']>>>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Array<InputMaybe<Scalars['UUID']['input']>>>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Array<InputMaybe<Scalars['UUID']['input']>>>;
  /** Contains the specified list of values. */
  in?: InputMaybe<Array<InputMaybe<Scalars['UUID']['input']>>>;
  /** Equal to the specified value. */
  is?: InputMaybe<Array<InputMaybe<Scalars['UUID']['input']>>>;
  /** Not equal to the specified value. */
  isNot?: InputMaybe<Array<InputMaybe<Scalars['UUID']['input']>>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Array<InputMaybe<Scalars['UUID']['input']>>>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Array<InputMaybe<Scalars['UUID']['input']>>>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Array<InputMaybe<Scalars['UUID']['input']>>>;
  /** Overlaps the specified list of values. */
  overlaps?: InputMaybe<Array<InputMaybe<Scalars['UUID']['input']>>>;
};

export type Value = Node & {
  __typename?: 'Value';
  /** Reads a single `Entity` that is related to this `Value`. */
  entity?: Maybe<Entity>;
  entityId: Scalars['UUID']['output'];
  id: Scalars['String']['output'];
  language?: Maybe<Scalars['String']['output']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  /** Reads a single `Property` that is related to this `Value`. */
  property?: Maybe<Property>;
  propertyId: Scalars['UUID']['output'];
  /** Reads a single `Space` that is related to this `Value`. */
  space?: Maybe<Space>;
  spaceId: Scalars['UUID']['output'];
  unit?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
};

/** A condition to be used against `Value` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type ValueCondition = {
  /** Checks for equality with the object’s `entityId` field. */
  entityId?: InputMaybe<Scalars['UUID']['input']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Checks for equality with the object’s `language` field. */
  language?: InputMaybe<Scalars['String']['input']>;
  /** Checks for equality with the object’s `propertyId` field. */
  propertyId?: InputMaybe<Scalars['UUID']['input']>;
  /** Checks for equality with the object’s `spaceId` field. */
  spaceId?: InputMaybe<Scalars['UUID']['input']>;
  /** Checks for equality with the object’s `unit` field. */
  unit?: InputMaybe<Scalars['String']['input']>;
  /** Checks for equality with the object’s `value` field. */
  value?: InputMaybe<Scalars['String']['input']>;
};

/** A filter to be used against `Value` object types. All fields are combined with a logical ‘and.’ */
export type ValueFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<ValueFilter>>;
  /** Filter by the object’s `entity` relation. */
  entity?: InputMaybe<EntityFilter>;
  /** Filter by the object’s `entityId` field. */
  entityId?: InputMaybe<UuidFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Filter by the object’s `language` field. */
  language?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<ValueFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<ValueFilter>>;
  /** Filter by the object’s `property` relation. */
  property?: InputMaybe<PropertyFilter>;
  /** Filter by the object’s `propertyId` field. */
  propertyId?: InputMaybe<UuidFilter>;
  /** Filter by the object’s `space` relation. */
  space?: InputMaybe<SpaceFilter>;
  /** Filter by the object’s `spaceId` field. */
  spaceId?: InputMaybe<UuidFilter>;
  /** Filter by the object’s `unit` field. */
  unit?: InputMaybe<StringFilter>;
  /** Filter by the object’s `value` field. */
  value?: InputMaybe<StringFilter>;
};

/** A connection to a list of `Value` values. */
export type ValuesConnection = {
  __typename?: 'ValuesConnection';
  /** A list of edges which contains the `Value` and cursor to aid in pagination. */
  edges: Array<ValuesEdge>;
  /** A list of `Value` objects. */
  nodes: Array<Value>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Value` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
};

/** A `Value` edge in the connection. */
export type ValuesEdge = {
  __typename?: 'ValuesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Value` at the end of the edge. */
  node: Value;
};

/** Methods to use when ordering `Value`. */
export type ValuesOrderBy =
  | 'ENTITY_ID_ASC'
  | 'ENTITY_ID_DESC'
  | 'ID_ASC'
  | 'ID_DESC'
  | 'LANGUAGE_ASC'
  | 'LANGUAGE_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC'
  | 'PROPERTY_ID_ASC'
  | 'PROPERTY_ID_DESC'
  | 'SPACE_ID_ASC'
  | 'SPACE_ID_DESC'
  | 'UNIT_ASC'
  | 'UNIT_DESC'
  | 'VALUE_ASC'
  | 'VALUE_DESC';

export type SchemaBrowserTypesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type SchemaBrowserTypesQuery = { __typename?: 'Query', typesList?: Array<{ __typename?: 'Entity', id: string, name?: string | null, description?: string | null, properties?: Array<{ __typename?: 'Property', id: string, name?: string | null, dataType: DataTypes, relationValueTypes?: Array<{ __typename?: 'Entity', id: string, name?: string | null, description?: string | null, properties?: Array<{ __typename?: 'Property', id: string, name?: string | null, dataType: DataTypes }> | null }> | null }> | null }> | null };

export type PropertiesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PropertiesQuery = { __typename?: 'Query', properties?: Array<{ __typename?: 'Property', id: string, name?: string | null, description?: string | null, dataType: DataTypes, relationValueTypes?: Array<{ __typename?: 'Entity', id: string, name?: string | null, description?: string | null, properties?: Array<{ __typename?: 'Property', id: string, dataType: DataTypes, name?: string | null }> | null }> | null }> | null };


export const SchemaBrowserTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SchemaBrowserTypes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"typesList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"dataType"}},{"kind":"Field","name":{"kind":"Name","value":"relationValueTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"dataType"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SchemaBrowserTypesQuery, SchemaBrowserTypesQueryVariables>;
export const PropertiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Properties"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"properties"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dataType"}},{"kind":"Field","name":{"kind":"Name","value":"relationValueTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataType"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PropertiesQuery, PropertiesQueryVariables>;