# @graphprotocol/hypergraph

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
