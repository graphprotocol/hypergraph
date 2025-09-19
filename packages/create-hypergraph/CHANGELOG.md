# create-hypergraph

## 0.5.5
### Patch Changes

- upgrade hypergraph dependencies

## 0.5.4
### Patch Changes

- de0d153: improve geo connect box based on authentication state in all templates

## 0.5.3
### Patch Changes

- 0546a02: upgrade dependencies

## 0.5.2
### Patch Changes

- internal restructurings

## 0.5.1
### Patch Changes

- 4d0f65f: bump dependencies

## 0.5.0
### Minor Changes

- df9e7eb: Add typesync script to templates. Bump both template @graphprotocol/hypergraph and @graphprotocol/hypergraph-react packages to 0.6.0 with typesync
  
  Running typesync:
  
  1. scaffold a hypergraph app: `pnpm create hypergraph@latest --template vite-react --package-manager pnpm my-hypergraph-app`
  2. approve builds: `pnpm approve-builds`
  3. run typesync: `pnpm run typesync`

## 0.4.6
### Patch Changes

- dcc05b3: improve templates (use Projects instead of Address, show space IDs, show Project IDs)

## 0.4.5
### Patch Changes

- 7e20c0b: improve projects listing in both templates
- b2fbdbb: add datasets (dapps, investment roundes, assets) to templates

## 0.4.4
### Patch Changes

- 72f8874: Bump to templates > @graphprotocol/hypergraph-react to latest version for usePublishToPublicSpace fix

## 0.4.3
### Patch Changes

- a16e5cf: Update the copy-package-json script to set the type to module on the package.json in the dist that gets published

## 0.4.2
### Patch Changes

- Update templates to use the Id from @graphprotocol/hypergraph package

## 0.4.1
### Patch Changes

- 21fe465: Bump @graphprotocol/hypergraph and @graphprotocol/hypergraph-react to latest in create-hypergraph

## 0.4.0
### Minor Changes

- 35504b3: Update templates to use Mapping exported from @graphprotocol/hypergraph package. Remove @graphprotocol/typesync dep from templates'

## 0.3.3
### Patch Changes

- c5822d5: Remove localhost syncServerUri from HypergraphAppProvider. uses default instead

## 0.3.2
### Patch Changes

- 91eb4fb: Update llms.txt to include nextjs template for visibility to AI agents

## 0.3.1
### Patch Changes

- 862688a: Update available create hypergraph templates in README to include nextjs for better visibility

## 0.3.0
### Minor Changes

- fadccd2: Include a nextjs template for selection with the create-hypergraph command.
  
  Example usage:
  
  ```bash
  pnpm create hypergraph@latest --template nextjs
  ```

## 0.2.0
### Minor Changes

- 3204607: Use workspace deps for create-hypergraph templates and replace with current version on copy into dist directory

## 0.1.0
### Patch Changes

- Initial release

## 0.1.3
### Patch Changes

- 9de4bd2: rename template-vite-react/.gitignore -> _gitignore to guarantee it gets published to npm. Rename back to `.gitignore` once the app is scaffolded.