'use client';

import {
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  queryOptions,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { Array as EffectArray } from 'effect';

import { API_ROOT_URL } from '../constants.js';
import * as Schema from '../schema.js';

export async function fetchApps(): Promise<ReadonlyArray<Schema.App>> {
  const result = await fetch(`${API_ROOT_URL}/apps`);
  if (result.status !== 200) {
    throw new Error('Failure fetching apps');
  }
  const json = await result.json();
  // decode into an array of App
  return Schema.AppListDecoder(json);
}

export const appsQueryOptions = queryOptions({
  queryKey: ['Space', 'Apps'] as const,
  async queryFn() {
    return await fetchApps();
  },
});

export type UseAppsQueryResult = UseQueryResult<ReadonlyArray<Schema.App>, Error>;
export function useAppsQuery(
  options: Omit<
    UseQueryOptions<ReadonlyArray<Schema.App>, Error, ReadonlyArray<Schema.App>, readonly ['Space', 'Apps']>,
    'queryKey' | 'queryFn'
  > = {},
): UseAppsQueryResult {
  return useQuery({
    ...appsQueryOptions,
    ...options,
  });
}

export type UseAppsSuspenseQueryResult = UseSuspenseQueryResult<ReadonlyArray<Schema.App>, Error>;
export function useAppsSuspenseQuery(
  options: Omit<
    UseSuspenseQueryOptions<ReadonlyArray<Schema.App>, Error, ReadonlyArray<Schema.App>, readonly ['Space', 'Apps']>,
    'queryKey' | 'queryFn'
  > = {},
): UseAppsSuspenseQueryResult {
  return useSuspenseQuery({
    ...appsQueryOptions,
    ...options,
  });
}

export async function fetchApp(id: number | string): Promise<Readonly<Schema.AppSchema> | null> {
  const result = await fetch(`${API_ROOT_URL}/apps/${id}`);
  if (result.status !== 200) {
    throw new Error('Failure fetching app details');
  }
  const json = await result.json();
  if (json == null) {
    return null;
  }
  // decode into an App instance
  return Schema.AppSchemaDecoder(json);
}

export const appQueryOptions = (id: number | string) =>
  queryOptions({
    queryKey: ['Space', 'Apps', 'details', id] as const,
    async queryFn() {
      return await fetchApp(id);
    },
  });

export type UseAppQueryResult = UseQueryResult<Readonly<Schema.App> | null, Error>;
export function useAppQuery(
  id: number | string,
  options: Omit<
    UseQueryOptions<
      Readonly<Schema.AppSchema> | null,
      Error,
      Readonly<Schema.AppSchema> | null,
      readonly ['Space', 'Apps', 'details', string | number]
    >,
    'queryKey' | 'queryFn'
  > = {},
): UseAppQueryResult {
  return useQuery({
    ...appQueryOptions(id),
    ...options,
  });
}

export type UseAppSuspenseQueryResult = UseSuspenseQueryResult<Readonly<Schema.App> | null, Error>;
export function useAppSuspenseQuery(
  id: number | string,
  options: Omit<
    UseSuspenseQueryOptions<
      Readonly<Schema.AppSchema> | null,
      Error,
      Readonly<Schema.AppSchema> | null,
      readonly ['Space', 'Apps', 'details', string | number]
    >,
    'queryKey' | 'queryFn'
  > = {},
): UseAppSuspenseQueryResult {
  return useSuspenseQuery({
    ...appQueryOptions(id),
    ...options,
  });
}

export async function fetchAppEvents(id: number | string): Promise<ReadonlyArray<Schema.AppEvent>> {
  const result = await fetch(`${API_ROOT_URL}/apps/${id}/events`);
  if (result.status !== 200) {
    throw new Error('Failure fetching app events');
  }
  const json = await result.json();
  if (json == null) {
    return [];
  }
  // decode into an array of AppEvent
  return Schema.AppEventsDecoder(json);
}

export const appEventsQueryOptions = (id: string | number) =>
  queryOptions({
    queryKey: ['Space', 'Apps', 'details', id, 'events'] as const,
    async queryFn() {
      return await fetchAppEvents(id);
    },
  });

export function useAppEventsQuery(
  id: number | string,
  options: Omit<
    UseQueryOptions<
      ReadonlyArray<Schema.AppEvent>,
      Error,
      ReadonlyArray<Schema.AppEvent>,
      readonly ['Space', 'Apps', 'details', string | number, 'events']
    >,
    'queryKey' | 'queryFn'
  > = {},
) {
  return useQuery({
    ...appEventsQueryOptions(id),
    ...options,
  });
}

export function useAppEventsSuspenseQuery(
  id: number | string,
  options: Omit<
    UseSuspenseQueryOptions<
      ReadonlyArray<Schema.AppEvent>,
      Error,
      ReadonlyArray<Schema.AppEvent>,
      readonly ['Space', 'Apps', 'details', string | number, 'events']
    >,
    'queryKey' | 'queryFn'
  > = {},
) {
  return useSuspenseQuery({
    ...appEventsQueryOptions(id),
    ...options,
  });
}

export async function createApp(create: Schema.InsertAppSchema): Promise<Readonly<Schema.App>> {
  const result = await fetch(`${API_ROOT_URL}/apps`, {
    method: 'POST',
    body: JSON.stringify({
      name: create.name,
      description: create.description,
      directory: create.directory,
      template: create.template,
      types: EffectArray.map(create.types, (type) => ({
        ...type,
        properties: EffectArray.map(type.properties, (prop) => ({
          ...prop,
          description: null,
          optional: null,
          nullable: null,
        })),
      })),
    }),
  });
  if (result.status !== 200) {
    throw new Error('Failure creating app');
  }
  const json = await result.json();
  // decode into an App instance
  return Schema.AppSchemaDecoder(json);
}

export type UseCreateAppMutationResult = UseMutationResult<Readonly<Schema.App>, Error, Schema.InsertAppSchema>;
export function useCreateAppMutation(
  options: Omit<
    UseMutationOptions<Readonly<Schema.App>, Error, Schema.InsertAppSchema>,
    'mutationKey' | 'mutationFn'
  > = {},
): UseCreateAppMutationResult {
  return useMutation<Readonly<Schema.App>, Error, Schema.InsertAppSchema>({
    mutationKey: ['Space', 'Apps', 'create'] as const,
    async mutationFn(vars) {
      return await createApp(vars);
    },
    ...options,
  });
}
