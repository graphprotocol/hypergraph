# @graphprotocol/hypergraph-react

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
