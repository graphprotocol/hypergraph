/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

import * as types from './graphql';

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
    "\n  query SchemaBrowserTypes($spaceId: String!, $limit: Int) {\n    types(spaceId: $spaceId, limit: $limit) {\n      id\n      name\n      properties {\n        id\n        dataType\n        entity {\n          id\n          name\n        }\n        relationValueTypes {\n          id\n          name\n          description\n          properties {\n            id\n            dataType\n            entity {\n              id\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n": typeof types.SchemaBrowserTypesDocument,
    "\n  query Properties {\n    properties {\n      id\n      dataType    \n      entity {\n        id\n        name\n        description\n      }\n      relationValueTypes {\n        id\n        name\n        description\n        properties {\n          id\n          dataType\n          entity {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n": typeof types.PropertiesDocument,
};
const documents: Documents = {
    "\n  query SchemaBrowserTypes($spaceId: String!, $limit: Int) {\n    types(spaceId: $spaceId, limit: $limit) {\n      id\n      name\n      properties {\n        id\n        dataType\n        entity {\n          id\n          name\n        }\n        relationValueTypes {\n          id\n          name\n          description\n          properties {\n            id\n            dataType\n            entity {\n              id\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n": types.SchemaBrowserTypesDocument,
    "\n  query Properties {\n    properties {\n      id\n      dataType    \n      entity {\n        id\n        name\n        description\n      }\n      relationValueTypes {\n        id\n        name\n        description\n        properties {\n          id\n          dataType\n          entity {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n": types.PropertiesDocument,
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
export function graphql(source: "\n  query SchemaBrowserTypes($spaceId: String!, $limit: Int) {\n    types(spaceId: $spaceId, limit: $limit) {\n      id\n      name\n      properties {\n        id\n        dataType\n        entity {\n          id\n          name\n        }\n        relationValueTypes {\n          id\n          name\n          description\n          properties {\n            id\n            dataType\n            entity {\n              id\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query SchemaBrowserTypes($spaceId: String!, $limit: Int) {\n    types(spaceId: $spaceId, limit: $limit) {\n      id\n      name\n      properties {\n        id\n        dataType\n        entity {\n          id\n          name\n        }\n        relationValueTypes {\n          id\n          name\n          description\n          properties {\n            id\n            dataType\n            entity {\n              id\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Properties {\n    properties {\n      id\n      dataType    \n      entity {\n        id\n        name\n        description\n      }\n      relationValueTypes {\n        id\n        name\n        description\n        properties {\n          id\n          dataType\n          entity {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Properties {\n    properties {\n      id\n      dataType    \n      entity {\n        id\n        name\n        description\n      }\n      relationValueTypes {\n        id\n        name\n        description\n        properties {\n          id\n          dataType\n          entity {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;