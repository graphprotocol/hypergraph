'use client';

import {
  type UseQueryResult,
  type UseSuspenseQueryResult,
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { Schema } from 'effect';

import { API_ROOT_URL } from '../constants.js';

export const CWDSchema = Schema.Struct({ cwd: Schema.NonEmptyTrimmedString });
export type CWDSchema = typeof CWDSchema.Type;

export async function fetchCWD() {
  const result = await fetch(`${API_ROOT_URL}/cwd`);
  if (result.status !== 200) {
    throw new Error('Failure fetching cwd from API');
  }
  const json = await result.json();
  // decode into an array of App
  return Schema.decodeUnknownSync(Schema.Struct({ cwd: Schema.NonEmptyTrimmedString }))(json);
}

export const cwdQueryOptions = queryOptions({
  queryKey: ['CWD'] as const,
  async queryFn() {
    return await fetchCWD();
  },
});

export type UseCWDQueryResult = UseQueryResult<CWDSchema, Error>;
export function useCWDQuery(): UseCWDQueryResult {
  return useQuery({
    ...cwdQueryOptions,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export type UseCWDSuspenseQueryResult = UseSuspenseQueryResult<CWDSchema, Error>;
export function useCWDSuspenseQuery(): UseCWDSuspenseQueryResult {
  return useSuspenseQuery({
    ...cwdQueryOptions,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
