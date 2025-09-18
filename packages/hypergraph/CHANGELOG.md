# @graphprotocol/hypergraph

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
