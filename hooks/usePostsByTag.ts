// hooks/usePostsByTag.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { get } from '@/lib/api';
import { PostDto } from '@/lib/types/post';

interface UsePostsByTagResult {
  posts: PostDto[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  page: number;
}

const PAGE_SIZE = 20;

export function usePostsByTag(tag: string): UsePostsByTagResult {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Fetch posts for the given page
  const fetchPosts = useCallback(async (pageNum: number) => {
    if (!tag) return;

    const isFirstPage = pageNum === 1;
    if (isFirstPage) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const encodedTag = encodeURIComponent(tag);
      const data = await get<PostDto[]>(
        `/posts/tag/${encodedTag}?page=${pageNum}&pageSize=${PAGE_SIZE}`
      );

      if (isFirstPage) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }

      // If we received fewer items than pageSize, there are no more pages
      setHasMore(data.length >= PAGE_SIZE);
    } catch (err: any) {
      console.error('usePostsByTag: Error fetching posts:', err);
      setError(err.message || 'Failed to load posts.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [tag]);

  // Fetch first page on mount or when tag changes
  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    fetchPosts(1);
  }, [tag, fetchPosts]);

  // Load more handler
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  }, [page, isLoadingMore, hasMore, fetchPosts]);

  return { posts, isLoading, isLoadingMore, error, hasMore, loadMore, page };
}
