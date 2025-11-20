# @graphprotocol/hypergraph-react

## 0.8.9
### Patch Changes

- 5ea0ad9: extend filter capability to check for existing relation e.g. `filter: { cover: { exists: true } }`
- Updated dependencies [5ea0ad9]
  - @graphprotocol/hypergraph@0.8.9

## 0.8.8
### Patch Changes

- d502673: add fetching of totalCount on relations
  
  For:
  
  ```ts
  export const Podcast = Entity.Schema(
    {
      name: Type.String,
      hosts: Type.Relation(Person),
    },
    {
      types: [Id('4c81561d-1f95-4131-9cdd-dd20ab831ba2')],
      properties: {
        name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
        hosts: Id('c72d9abb-bca8-4e86-b7e8-b71e91d2b37e'),
      },
    },
  );
  ```
  
  you can now use:
  
  ```ts
  useEntities(Podcast, {
    mode: 'public',
    include: {
      hostsTotalCount: true,
    },
  });
  ```
- 083edfd: add Type.Backlink
- Updated dependencies [d502673]
- Updated dependencies [083edfd]
  - @graphprotocol/hypergraph@0.8.8

## 0.8.7
### Patch Changes

- 7ed329b: fix resolving optional values in a Relation Entity
- Updated dependencies [7ed329b]
  - @graphprotocol/hypergraph@0.8.7

## 0.8.6
### Patch Changes

- 8c2c42b: add Entity.findOnePublic
- Updated dependencies [8c2c42b]
  - @graphprotocol/hypergraph@0.8.6

## 0.8.5
### Patch Changes

- d23643d: add temporary backlinksTotalCountsTypeId1 to Entity.findManyPublic and useEntities
- Updated dependencies [d23643d]
  - @graphprotocol/hypergraph@0.8.5

## 0.8.4
### Patch Changes

- 69923e1: add orderBy to Entities.findManyPublic and useEntities(mode: 'public')
- Updated dependencies [69923e1]
  - @graphprotocol/hypergraph@0.8.4

## 0.8.3
### Patch Changes

- dded603: add useEntitiesPublicInfinite hook]
- f51992d: add param `offset` for Entity.findManyPublic, Entity.searchManyPublic, useEntities
- Updated dependencies [f51992d]
  - @graphprotocol/hypergraph@0.8.3

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
- Updated dependencies [b939d6b]
  - @graphprotocol/hypergraph@0.8.2

## 0.8.1
### Patch Changes

- 887dbc3: rename Entity.findMany to findManyPrivate and add Entity.findManyPublic
- a4898c4: add Entity.searchManyPublic
- Updated dependencies [887dbc3]
- Updated dependencies [a4898c4]
  - @graphprotocol/hypergraph@0.8.1

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

### Patch Changes

- Updated dependencies [edf7630]
  - @graphprotocol/hypergraph@0.8.0

## 0.7.3
### Patch Changes

- 1d29c53: improve processConnectAuthSuccess behaviour

## 0.7.2
### Patch Changes

- 55a6403: upgrade grc-20 dependency
- b7cc2fa: add privy auth based createSpace hooks
- Updated dependencies [55a6403]
  - @graphprotocol/hypergraph@0.6.6

## 0.7.1
### Patch Changes

- b780f76: add privy authentication functionality for internal apps
- Updated dependencies [b780f76]
  - @graphprotocol/hypergraph@0.6.5

## 0.7.0
### Minor Changes

- 604724b: remove useQueryEntity and add useEntity hook

### Patch Changes

- Updated dependencies [604724b]
  - @graphprotocol/hypergraph@0.6.4

## 0.6.3
### Patch Changes

- 0546a02: upgrade dependencies
- Updated dependencies [0546a02]
- Updated dependencies [2baa671]
  - @graphprotocol/hypergraph@0.6.3

## 0.6.2
### Patch Changes

- internal restructurings
- Updated dependencies
  - @graphprotocol/hypergraph@0.6.2

## 0.6.1
### Patch Changes

- c476388: fix type for useQuery filter option to allow for or/not operators
- Updated dependencies [8ab0100]
  - @graphprotocol/hypergraph@0.6.1

## 0.6.0
### Patch Changes

- Updated dependencies [cbc98ed]
  - @graphprotocol/hypergraph@0.6.0

## 0.5.0
### Patch Changes

- Updated dependencies [9d22312]
  - @graphprotocol/hypergraph@0.5.0

## 0.4.3
### Patch Changes

- d7b4fe0: Update variable types of usePublishToPublicSpace function to accept and instance of an Entity and not the Entity type

## 0.4.2
### Patch Changes

- 4410012: add value filtering for useQuery(Type, { mode: "public", … })
- Updated dependencies [4410012]
  - @graphprotocol/hypergraph@0.4.2

## 0.4.1
### Patch Changes

- Updated dependencies [e324e68]
  - @graphprotocol/hypergraph@0.4.1

## 0.4.0
### Minor Changes

- 9b29006: change dataType (text -> string, checkbox -> boolean) and update queries using value

### Patch Changes

- Updated dependencies [9b29006]
  - @graphprotocol/hypergraph@0.4.0

## 0.3.1
### Patch Changes

- f4fd295: update grc-20 library
- 3f91e84: Add usePublishToPublicSpace hook
- Updated dependencies [b37483e]
- Updated dependencies [f4fd295]
  - @graphprotocol/hypergraph@0.3.1

## 0.3.0
### Minor Changes

- cb54727: rename Type.Text to Type.String
- c0035eb: rename Type.Checkbox to Type.Boolean

### Patch Changes

- f8ccaed: add Type.optional
- a755f7c: update default sync server url
- Updated dependencies [cb54727]
- Updated dependencies [c0035eb]
- Updated dependencies [f8ccaed]
  - @graphprotocol/hypergraph@0.3.0

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

### Patch Changes

- Updated dependencies [8622688]
  - @graphprotocol/hypergraph@0.2.0

## 0.1.0
### Patch Changes

- dd4746a: remove unsupported dataType Url
- fd0a13f: extract Mapping to @graphprotocol/typesync
- 114d743: breaking changes of the authentication flow to improve security and fix invitations
- Update the default syncServerUri to https://hypergraph-sync.up.railway.app
- Updated dependencies [dd4746a]
- Updated dependencies [fd0a13f]
- Updated dependencies [114d743]
  - @graphprotocol/hypergraph@0.1.0
  - @graphprotocol/typesync@0.1.0
