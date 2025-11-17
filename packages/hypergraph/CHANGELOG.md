# @graphprotocol/hypergraph

## 0.8.4
### Patch Changes

- 69923e1: add orderBy to Entities.findManyPublic and useEntities(mode: 'public')

## 0.8.3
### Patch Changes

- f51992d: add param `offset` for Entity.findManyPublic, Entity.searchManyPublic, useEntities

## 0.8.2
### Patch Changes

- b939d6b: Extend Entity.Schema to allow querying for relation entity values
  
  In the following example we define a Project entity and a Podcast entity with the relation `projects` to the Project entity. In the Type.Relation you now can define the properties of the relation entity as a second argument. In the mapping you also need to define the properties of the relation entity instead of just the property id of the relation.
  
  ```ts
  export const Project = Entity.Schema(
    {
      name: Type.String,
    },
    {
      types: [Id('69732974-c632-490d-81a3-12ea567b2a8e')],
      properties: {
        name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      },
    },
  );
  
  export const Podcast = Entity.Schema(
    {
      name: Type.String,
      projects: Type.Relation(Project, {
        properties: {
          website: Type.optional(Type.String),
        },
      }),
    },
    {
      types: [Id('69732974-c632-490d-81a3-12ea567b2a8e')],
      properties: {
        name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
        projects: {
          propertyId: Id('71931b5f-1d6a-462e-81d9-5b8e85fb5c4b'),
          properties: {
            website: Id('eed38e74-e679-46bf-8a42-ea3e4f8fb5fb'),
          },
        },
      },
    },
  );
  ```

## 0.8.1
### Patch Changes

- 887dbc3: rename Entity.findMany to findManyPrivate and add Entity.findManyPublic
- a4898c4: add Entity.searchManyPublic

## 0.8.0
### Minor Changes

- edf7630: Schema Definition API Change (Breaking Change)
  
  Before:
  ```ts
  export class User extends Entity.Class<User>('User')({
    name: Type.String,
  }) {}
  ```
  
  After:
  ```ts
  export const User = Entity.Schema(
    { name: Type.String },
    {
      types: [Id('bffa181e-a333-495b-949c-57f2831d7eca')],
      properties: {
        name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      },
    },
  );
  ```
  
  All entity definitions need to be rewritten. The new API requires explicit type IDs and property IDs.

## 0.7.3
### Patch Changes

- Catch up with hypergraph-react version

## 0.6.6
### Patch Changes

- 55a6403: upgrade grc-20 dependency

## 0.6.5
### Patch Changes

- b780f76: add privy authentication functionality for internal apps

## 0.6.4
### Patch Changes

- 604724b: improve include type for fineOne

## 0.6.3
### Patch Changes

- 0546a02: upgrade dependencies
- 2baa671: Removed Url from the TypeSelect in typesync-studio

## 0.6.2
### Patch Changes

- internal restructurings

## 0.6.1
### Patch Changes

- 8ab0100: fixes loading the initial schema in typesync

## 0.6.0
### Minor Changes

- cbc98ed: Introduced a cli tool and typesync studio UI to let users graphically visualize, update, and publish their hypergraph schemas.
  
  1. install the latest `@graphprotocol/hypergraph` version: `pnpm add @graphprotocol/hypergraph@latest`
  2. add a script to your `package.json` to open the typesync studio: `"typesync": "hg typesync --open"`
  3. open your browser to http://localhost:3000
  4. view your current Hypergraph app schema, parsed from your `schema.ts` file
  5. update your schema, view existing types and properties on the Knowledge Graph. add types and properties.
  6. sync your schema updates to your schema.ts file
  7. publish your schema to the Knowledge Graph.

## 0.5.0
### Minor Changes

- 9d22312: rework filter logic to match public filter logic - logic operators are only allowed at the cross-field level

## 0.4.2
### Patch Changes

- 4410012: add value filtering for useQuery(Type, { mode: "public", … })

## 0.4.1
### Patch Changes

- e324e68: use Id from @graphprotocol/hypergraph

## 0.4.0
### Minor Changes

- 9b29006: change dataType (text -> string, checkbox -> boolean) and update queries using value

## 0.3.1
### Patch Changes

- b37483e: export Id (re-exported from grc-20)
- f4fd295: update grc-20 library

## 0.3.0
### Minor Changes

- cb54727: rename Type.Text to Type.String
- c0035eb: rename Type.Checkbox to Type.Boolean

### Patch Changes

- f8ccaed: add Type.optional

## 0.2.0
### Minor Changes

- 8622688: Move @graphprotocol/typesync Mapping and Utils into @graphprotocol/hypergraph package and export from there. Update @graphprotocol/hypergraph-react to use mapping from @graphprotocol/hypergraph.
  
  
  ## Changes needed
  
  Any use of `@graphprotocol/typesync` should use the exported mapping and utils from `@graphprotocol/hypergraph` instead.
  
  ### Example
  
  ```ts
  // before
  import type { Mapping } from '@graphprotocol/typesync/Mapping'
  
  // after
  import type { Mapping } from '@graphprotocol/hypergraph/mapping'
  ```

## 0.1.0
### Patch Changes

- dd4746a: remove unsupported dataType Url
- fd0a13f: extract Mapping to @graphprotocol/typesync
- 114d743: breaking changes of the authentication flow to improve security and fix invitations
- Updated dependencies [dd4746a]
  - @graphprotocol/typesync@0.1.0
