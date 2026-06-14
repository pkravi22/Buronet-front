// hooks/useFollowSuggestions.ts
// Fetches "People You May Want to Follow" from GET /api/Follow/suggestions
// Uses SWR for caching + revalidation so the widget stays fresh without extra requests.

import useSWR from 'swr';
import { get } from '@/lib/api';
import { FollowUserDto } from './useFollow';

const fetcher = (url: string) => get<FollowUserDto[]>(url);

export const useFollowSuggestions = (limit = 5, enabled = true) => {
  const { data, error, isLoading, mutate } = useSWR<FollowUserDto[]>(
    enabled ? `/Follow/suggestions?limit=${limit}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000, // cache for 1 minute
    }
  );

  // Call after a follow action so the widget removes the followed user
  const removeSuggestion = (userId: string) => {
    mutate(
      (prev) => (prev ? prev.filter((u) => u.userId !== userId) : prev),
      { revalidate: false }
    );
  };

  return {
    suggestions: data ?? [],
    isLoading,
    error,
    removeSuggestion,
    refetch: () => mutate(),
  };
};
