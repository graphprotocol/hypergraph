import { useContext } from 'react';
import { type HypergraphContext, HypergraphReactContext } from '../HypergraphSpaceContext.js';

export function useHypergraphSpaceInternal() {
  const context = useContext(HypergraphReactContext);
  return (context as HypergraphContext) || { space: '' };
}
