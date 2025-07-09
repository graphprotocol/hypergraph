import { Schema } from 'effect';
import * as Messages from '../messages/index.js';

export const listPublicSpaceInboxes = async ({
  spaceId,
  syncServerUri,
}: Readonly<{ spaceId: string; syncServerUri: string }>): Promise<readonly Messages.SpaceInboxPublic[]> => {
  const res = await fetch(new URL(`/spaces/${spaceId}/inboxes`, syncServerUri), {
    method: 'GET',
  });
  const decoded = Schema.decodeUnknownSync(Messages.ResponseListSpaceInboxesPublic)(await res.json());
  return decoded.inboxes;
};

export const listPublicAccountInboxes = async ({
  accountAddress,
  syncServerUri,
}: Readonly<{ accountAddress: string; syncServerUri: string }>): Promise<readonly Messages.AccountInboxPublic[]> => {
  const res = await fetch(new URL(`/accounts/${accountAddress}/inboxes`, syncServerUri), {
    method: 'GET',
  });
  const decoded = Schema.decodeUnknownSync(Messages.ResponseListAccountInboxesPublic)(await res.json());
  return decoded.inboxes;
};

export const getSpaceInbox = async ({
  spaceId,
  inboxId,
  syncServerUri,
}: Readonly<{ spaceId: string; inboxId: string; syncServerUri: string }>): Promise<Messages.SpaceInboxPublic> => {
  const res = await fetch(new URL(`/spaces/${spaceId}/inboxes/${inboxId}`, syncServerUri), {
    method: 'GET',
  });
  const decoded = Schema.decodeUnknownSync(Messages.ResponseSpaceInboxPublic)(await res.json());
  return decoded.inbox;
};

export const getAccountInbox = async ({
  accountAddress,
  inboxId,
  syncServerUri,
}: Readonly<{
  accountAddress: string;
  inboxId: string;
  syncServerUri: string;
}>): Promise<Messages.AccountInboxPublic> => {
  const res = await fetch(new URL(`/accounts/${accountAddress}/inboxes/${inboxId}`, syncServerUri), {
    method: 'GET',
  });
  const decoded = Schema.decodeUnknownSync(Messages.ResponseAccountInboxPublic)(await res.json());
  return decoded.inbox;
};
