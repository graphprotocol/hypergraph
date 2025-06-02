'use client';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';

type UseOSQueryResult = UseQueryResult<Readonly<'Windows' | 'MacOS' | 'Linux' | 'unknown'>, Error>;

export function useOSQuery(): UseOSQueryResult {
  return useQuery({
    queryKey: ['OS'] as const,
    async queryFn() {
      const userAgent = window.navigator.userAgent;
      const platform = window.navigator.platform;

      // Detect OS
      if (userAgent.indexOf('Win') !== -1 || platform.indexOf('Win') !== -1) {
        return 'Windows' as const;
      }

      if (userAgent.indexOf('Mac') !== -1 || platform.indexOf('Mac') !== -1) {
        return 'MacOS' as const;
      }

      if (userAgent.indexOf('Linux') !== -1 || platform.indexOf('Linux') !== -1) {
        return 'Linux' as const;
      }

      return 'unknown' as const;
    },
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
