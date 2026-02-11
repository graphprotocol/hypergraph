# @graphprotocol/hypergraph-react

## 0.13.2
### Patch Changes

- a1781a1: upgrade geo-sdk to 0.9.0
- Updated dependencies [a1781a1]
  - @graphprotocol/hypergraph@0.13.2

## 0.13.1
### Patch Changes

- bd40ec3: Update geo-sdk type names: float64 to float, bool to boolean. Replace removed Graph.createSpace calls with no-op alerts.
- Updated dependencies [bd40ec3]
  - @graphprotocol/hypergraph@0.13.1

## 0.13.0
### Patch Changes

- Updated dependencies [8478897]
  - @graphprotocol/hypergraph@0.13.0

## 0.12.1
### Patch Changes

- 3b1fa92: upgrade geo-sdk and improve internally used graphql queries
- Updated dependencies [3b1fa92]
  - @graphprotocol/hypergraph@0.12.1

## 0.12.0
### Minor Changes

- 1ca4e09: upgrade geo-sdk to switch to the new date, datetime & time encoding

### Patch Changes

- Updated dependencies [1ca4e09]
  - @graphprotocol/hypergraph@0.12.0

## 0.11.3
### Patch Changes

- switch to geo-sdk and update API url
- Updated dependencies
  - @graphprotocol/hypergraph@0.11.3

## 0.11.2
### Patch Changes

- f17af71: replace deprecated GrcOp with Op from grc-20
- Updated dependencies [f17af71]
  - @graphprotocol/hypergraph@0.11.2

## 0.11.1
### Patch Changes

- f89023b: - Rename `time` field to `datetime` in GraphQL valuesList queries
  - Add `ScheduleString` type for querying schedule fields
- Updated dependencies [f89023b]
  - @graphprotocol/hypergraph@0.11.1

## 0.11.0
### Minor Changes

- update graphql queries to new API and upgrade the grc-20 library to use the new data types
- Updated dependencies
  - @graphprotocol/hypergraph@0.11.0

## 0.10.6
### Patch Changes

- 5b22a3f: Add `type` field to `PublicSpace` type returned by `Space.findManyPublic()` and `usePublicSpaces()`. The type is either `"PERSONAL"` or `"DAO"`.
  
  Add `spaceType` filter option to `Space.findManyPublic()` and `usePublicSpaces()` to filter spaces by type. Example usage:
  
  ```typescript
  // Filter for DAO spaces only
  const { data } = usePublicSpaces({ filter: { spaceType: 'DAO' } });
  
  // Combine with existing filters
  const { data } = usePublicSpaces({ filter: { editorId: 'xxx', spaceType: 'PERSONAL' } });
  ```
- Updated dependencies [5b22a3f]
  - @graphprotocol/hypergraph@0.10.6

## 0.10.5
### Patch Changes

- Updated dependencies [5504bd4]
  - @graphprotocol/hypergraph@0.10.5

## 0.10.4
### Patch Changes

- 5b8f1f6: fix date parsing
- Updated dependencies [5b8f1f6]
  - @graphprotocol/hypergraph@0.10.4

## 0.10.3
### Patch Changes

- Updated dependencies [d7f578c]
  - @graphprotocol/hypergraph@0.10.3

## 0.10.2
### Patch Changes

- 8a09ffd: fix useSpaces and Space.findManyPublic for new API
- Updated dependencies [8a09ffd]
  - @graphprotocol/hypergraph@0.10.2

## 0.10.1
### Patch Changes

- 509cfbe: Add configurable API origin support
  
  - Add `Config.setApiOrigin()` and `Config.getApiOrigin()` functions to allow setting a custom API origin globally
  - Add `apiOrigin` prop to `HypergraphAppProvider` for React apps
  - Replace all hardcoded `Graph.TESTNET_API_ORIGIN` references with configurable `Config.getApiOrigin()`
  - Default behavior remains unchanged (uses testnet) if not configured
- Updated dependencies [509cfbe]
  - @graphprotocol/hypergraph@0.10.1

## 0.10.0
### Minor Changes

- 0f777fa: For IDs switch from UUIDs with dashes to UUIDs without dashes e.g. "a126ca53-0c8e-48d5-b888-82c734c38935" to "a126ca530c8e48d5b88882c734c38935"
  
  - For all public API endpoints switch from `/graphql` to `/v2/graphql`
  - Expose new Utils: `Utils.GeoIdSchema`, `Utils.normalizeGeoId`, `Utils.isGeoId`, `Utils.parseGeoId`, `Utils.toUuid`

### Patch Changes

- Updated dependencies [0f777fa]
  - @graphprotocol/hypergraph@0.10.0

## 0.9.1
### Patch Changes

- f7319e0: remove injected __schema from findManyPublic and useEntities in public mode entries
- Updated dependencies [f7319e0]
  - @graphprotocol/hypergraph@0.9.1

## 0.9.0
### Minor Changes

- 56f49c4: Change behavior of entity validation by filtering out invalid entities of relations and adding them to `invalidRelationEntities`
- 56f49c4: enrich `invalidEntities` to expose both the raw payload and decode error for each invalid entity
- 56f49c4: Entity.findOnePublic will return { entity: null, invalidEntity: { raw: {…}, error: … } } instead of throwing an error in case it's an invalid entity
- 3f8c22d: GraphQL relation and backlink queries now filter for entity types for more correct resuls. This applies across findOne, findMany, searchMany, useEntity and useEntities

### Patch Changes

- 956aaa4: Removed the temporary `backlinksTotalCountsTypeId1` option and response field from `Entity.findManyPublic` and the React `useEntities` helpers.
- 56f49c4: Add a logInvalidResults toggle to `Entity.findOnePublic/findManyPublic`, plus pass-through support in the React provider and hooks, so apps can selectively silence or surface schema-validation warnings while still receiving the invalid payload lists.
- e4a7f22: Added `includeSpaceIds` parameter to `findOnePublic`, `findManyPublic`, `searchManyPublic`, `useEntities` and `useEntity`
- e04e477: Allow relation includes to override nested relation and value space filters by adding _config: { relationSpaces, valueSpaces } to any include branch; GraphQL fragments now honor those overrides when building queries.
  
  ```
  include: {
    friends: {
      _config: {
        relationSpaces: ['space-a', 'space-b'],
        valueSpaces: 'all',
      },
    },
  }
  ```
- Updated dependencies [56f49c4]
- Updated dependencies [56f49c4]
- Updated dependencies [956aaa4]
- Updated dependencies [56f49c4]
- Updated dependencies [56f49c4]
- Updated dependencies [3f8c22d]
- Updated dependencies [e4a7f22]
- Updated dependencies [e04e477]
  - @graphprotocol/hypergraph@0.9.0

## 0.8.10
### Patch Changes

- b8bae14: Add filtering entities by id e.g.
  
  ```ts
  const { data } = useEntities(Person, {
    filter: {
      or: [
        { id: { is: 'fe9f0c57-3682-4a77-8ef4-205da3cd0a33' } },
        { id: { is: '1e5dcefd-bae0-4133-b743-6d2d7bebc5b9' } },
      ],
    },
  });
  ```
- 4642397: Add Space.findManyPublic plus the usePublicSpaces hook so apps can fetch and render public spaces (with invalid entries surfaced) via one shared SDK call
- 40111af: Add support for querying public entities across multiple spaces (including an `all` scope) and expose the new API through the React hooks
- Updated dependencies [b8bae14]
- Updated dependencies [4642397]
- Updated dependencies [40111af]
  - @graphprotocol/hypergraph@0.8.10

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
