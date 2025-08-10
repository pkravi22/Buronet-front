// hooks/useTrendingTags.ts
import { useState, useEffect } from 'react';
import { get } from '../lib/api';
import { TagWithTotalCountDto } from '@/lib/types/post';

interface UseTrendingTagsResult {
  tags: TagWithTotalCountDto[];
  isLoading: boolean;
  isError: string | null;
}

export const useTrendingTags = (): UseTrendingTagsResult => {
  const [tags, setTags] = useState<TagWithTotalCountDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      setIsError(null);
      try {
        const trendingTags = await get<TagWithTotalCountDto[]>('/posts/trending-tags?limit=10');
        setTags(trendingTags);
      } catch (err: any) {
        console.error("useTrendingTags: Error fetching tags:", err);
        setIsError(err.message || "Failed to load trending tags.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTags();
  }, []);

  return { tags, isLoading, isError };
};