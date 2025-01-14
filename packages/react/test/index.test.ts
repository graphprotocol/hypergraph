import { describe, expect, it } from 'vitest';

import { HypergraphReactFramework } from '../src/index.js';

describe('@graphprotocol/hypergraph-react', () => {
  it('should return the export', () => {
    expect(HypergraphReactFramework).not.toBeNull();
  });
});
