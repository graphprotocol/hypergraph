/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query SchemaBrowserTypes($first: Int) {\n    typesList(first: $first) {\n      id\n      name\n      description\n      properties {\n        id\n        name\n        dataType\n        relationValueTypes {\n          id\n          name\n          description\n          properties {\n            id\n            name\n            dataType\n          }\n        }\n      }\n    }\n  }\n": typeof types.SchemaBrowserTypesDocument,
    "\n  query TypeSearch($query: String!, $first: Int) {\n    typesList: search(\n      query: $query\n      first: $first\n      filter: {backlinksExist: true, typeIds: {in: [\"e7d737c5-3676-4c60-9fa1-6aa64a8c90ad\"]}}\n    ) {\n      id\n      name\n      description\n      properties {\n        id\n        name\n        dataType\n        relationValueTypes {\n          id\n          name\n          description\n          properties {\n            id\n            name\n            dataType\n          }\n        }\n      }\n    }\n  }\n": typeof types.TypeSearchDocument,
    "\n  query Properties($query: String, $first: Int) {\n    properties(\n      first: $first\n      filter: {or: [{name: {includesInsensitive: $query}}, {description: {includesInsensitive: $query}}]}\n    ) {\n      id\n      name\n      description\n      dataType\n      relationValueTypes {\n        id\n        name\n        description\n        properties {\n          id\n          dataType\n          name\n        }\n      }\n    }\n  }\n": typeof types.PropertiesDocument,
};
const documents: Documents = {
    "\n  query SchemaBrowserTypes($first: Int) {\n    typesList(first: $first) {\n      id\n      name\n      description\n      properties {\n        id\n        name\n        dataType\n        relationValueTypes {\n          id\n          name\n          description\n          properties {\n            id\n            name\n            dataType\n          }\n        }\n      }\n    }\n  }\n": types.SchemaBrowserTypesDocument,
    "\n  query TypeSearch($query: String!, $first: Int) {\n    typesList: search(\n      query: $query\n      first: $first\n      filter: {backlinksExist: true, typeIds: {in: [\"e7d737c5-3676-4c60-9fa1-6aa64a8c90ad\"]}}\n    ) {\n      id\n      name\n      description\n      properties {\n        id\n        name\n        dataType\n        relationValueTypes {\n          id\n          name\n          description\n          properties {\n            id\n            name\n            dataType\n          }\n        }\n      }\n    }\n  }\n": types.TypeSearchDocument,
    "\n  query Properties($query: String, $first: Int) {\n    properties(\n      first: $first\n      filter: {or: [{name: {includesInsensitive: $query}}, {description: {includesInsensitive: $query}}]}\n    ) {\n      id\n      name\n      description\n      dataType\n      relationValueTypes {\n        id\n        name\n        description\n        properties {\n          id\n          dataType\n          name\n        }\n      }\n    }\n  }\n": types.PropertiesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SchemaBrowserTypes($first: Int) {\n    typesList(first: $first) {\n      id\n      name\n      description\n      properties {\n        id\n        name\n        dataType\n        relationValueTypes {\n          id\n          name\n          description\n          properties {\n            id\n            name\n            dataType\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query SchemaBrowserTypes($first: Int) {\n    typesList(first: $first) {\n      id\n      name\n      description\n      properties {\n        id\n        name\n        dataType\n        relationValueTypes {\n          id\n          name\n          description\n          properties {\n            id\n            name\n            dataType\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TypeSearch($query: String!, $first: Int) {\n    typesList: search(\n      query: $query\n      first: $first\n      filter: {backlinksExist: true, typeIds: {in: [\"e7d737c5-3676-4c60-9fa1-6aa64a8c90ad\"]}}\n    ) {\n      id\n      name\n      description\n      properties {\n        id\n        name\n        dataType\n        relationValueTypes {\n          id\n          name\n          description\n          properties {\n            id\n            name\n            dataType\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query TypeSearch($query: String!, $first: Int) {\n    typesList: search(\n      query: $query\n      first: $first\n      filter: {backlinksExist: true, typeIds: {in: [\"e7d737c5-3676-4c60-9fa1-6aa64a8c90ad\"]}}\n    ) {\n      id\n      name\n      description\n      properties {\n        id\n        name\n        dataType\n        relationValueTypes {\n          id\n          name\n          description\n          properties {\n            id\n            name\n            dataType\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Properties($query: String, $first: Int) {\n    properties(\n      first: $first\n      filter: {or: [{name: {includesInsensitive: $query}}, {description: {includesInsensitive: $query}}]}\n    ) {\n      id\n      name\n      description\n      dataType\n      relationValueTypes {\n        id\n        name\n        description\n        properties {\n          id\n          dataType\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Properties($query: String, $first: Int) {\n    properties(\n      first: $first\n      filter: {or: [{name: {includesInsensitive: $query}}, {description: {includesInsensitive: $query}}]}\n    ) {\n      id\n      name\n      description\n      dataType\n      relationValueTypes {\n        id\n        name\n        description\n        properties {\n          id\n          dataType\n          name\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;