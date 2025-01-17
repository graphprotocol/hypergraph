'use client';

import * as automerge from '@automerge/automerge';
import { uuid } from '@automerge/automerge';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { useSelector as useSelectorStore } from '@xstate/store/react';
import { Effect, Exit } from 'effect';
import * as Schema from 'effect/Schema';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Address } from 'viem';

import { Messages, SpaceEvents, type SpaceStorageEntry } from '@graphprotocol/hypergraph';

const decodeResponseMessage = Schema.decodeUnknownEither(Messages.ResponseMessage);

export type HypergraphAppCtx = {
  invitations: Array<Messages.Invitation>;
  createSpace(): Promise<unknown>;
  listSpaces(): void;
  listInvitations(): void;
  acceptInvitation(params: Readonly<{ invitation: Messages.Invitation }>): Promise<unknown>;
  subscribeToSpace(params: Readonly<{ spaceId: string }>): void;
  inviteToSpace(params: Readonly<{ space: SpaceStorageEntry; invitee: { accountId: Address } }>): Promise<unknown>;
  loading: boolean;
};

export const HypergraphAppContext = createContext<HypergraphAppCtx>({
  invitations: [],
  async createSpace() {
    return {};
  },
  listSpaces() {},
  listInvitations() {},
  async acceptInvitation() {
    return {};
  },
  subscribeToSpace() {},
  async inviteToSpace() {
    return {};
  },
  loading: true,
});

export function useHypergraphApp() {
  return useContext<HypergraphAppCtx>(HypergraphAppContext);
}

export type HypergraphAppProviderProps = Readonly<{
  accountId: string;
  syncServer?: string;
  sessionToken?: string | null;
  children: React.ReactNode;
}>;
