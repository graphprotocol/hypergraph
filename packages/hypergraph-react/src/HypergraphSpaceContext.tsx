'use client';

import { createContext, type ReactNode } from 'react';

// TODO space can be undefined
export type HypergraphContext = { space: string };

export const HypergraphReactContext = createContext<HypergraphContext | undefined>(undefined);

export function HypergraphSpaceProvider({ space, children }: { space: string; children: ReactNode }) {
  return <HypergraphReactContext.Provider value={{ space }}>{children}</HypergraphReactContext.Provider>;
}
