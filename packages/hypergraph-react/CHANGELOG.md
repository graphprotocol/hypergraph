# @graphprotocol/hypergraph-react

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
