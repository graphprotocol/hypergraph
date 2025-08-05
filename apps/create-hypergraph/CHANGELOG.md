# create-hypergraph

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