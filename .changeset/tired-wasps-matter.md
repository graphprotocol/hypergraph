---
"@graphprotocol/hypergraph-react": minor
"@graphprotocol/hypergraph": minor
---

Move @graphprotocol/typesync Mapping and Utils into @graphprotocol/hypergraph package and export from there. Update @graphprotocol/hypergraph-react to use mapping from @graphprotocol/hypergraph.
  

## Changes needed

Any use of `@graphprotocol/typesync` should use the exported mapping and utils from `@graphprotocol/hypergraph` instead.

### Example

```ts
// before
import type { Mapping } from '@graphprotocol/typesync/Mapping'

// after
import type { Mapping } from '@graphprotocol/hypergraph/mapping'
```