---
"@graphprotocol/hypergraph": minor
---

Introduced a cli tool and typesync studio UI to let users graphically visualize, update, and publish their hypergraph schemas.

1. install the latest `@graphprotocol/hypergraph` version: `pnpm add @graphprotocol/hypergraph@latest`
2. add a script to your `package.json` to open the typesync studio: `"typesync": "hg typesync --open"`
3. open your browser to http://localhost:3000
4. view your current Hypergraph app schema, parsed from your `schema.ts` file
5. update your schema, view existing types and properties on the Knowledge Graph. add types and properties.
6. sync your schema updates to your schema.ts file
7. publish your schema to the Knowledge Graph.