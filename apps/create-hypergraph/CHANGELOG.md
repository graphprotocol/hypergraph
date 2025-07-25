# create-hypergraph

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