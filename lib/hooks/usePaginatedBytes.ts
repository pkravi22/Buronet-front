import { useCallback, useRef, useState } from 'react';
import { Byte, SuggestionType } from '@/lib/types/Byte';
import { get } from '@/lib/api';

const BATCH_SIZE = 10;
const MAX_BYTES_IN_MEMORY = 50;

interface UsePaginatedBytesReturn {
  bytes: Byte[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  reset: () => void;
  updateByte: (byteId: string, updates: Partial<Byte>) => void;
}

export const usePaginatedBytes = (filter: SuggestionType): UsePaginatedBytesReturn => {
  const [bytes, setBytes] = useState<Byte[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const totalFetchedRef = useRef(0);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const fetchedBytes = await get<Byte[]>(
        `/bytes/feed?filter=${filter}&page=${pageRef.current}&limit=${BATCH_SIZE}`
      );

      if (fetchedBytes.length === 0) {
        setHasMore(false);
      } else if (fetchedBytes.length < BATCH_SIZE) {
        // Last page - fewer items than batch size
        setBytes((prevBytes) => [...prevBytes, ...fetchedBytes]);
        setHasMore(false);
        pageRef.current += 1;
        totalFetchedRef.current += fetchedBytes.length;
      } else {
        // Normal page - add bytes without removing old ones
        setBytes((prevBytes) => [...prevBytes, ...fetchedBytes]);
        pageRef.current += 1;
        totalFetchedRef.current += fetchedBytes.length;
      }
    } catch (err) {
      console.error('Failed to fetch bytes:', err);
      setHasMore(false);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [filter, hasMore]);

  const reset = useCallback(() => {
    setBytes([]);
    setIsLoading(false);
    setHasMore(true);
    pageRef.current = 1;
    isFetchingRef.current = false;
  }, []);

  const updateByte = useCallback((byteId: string, updates: Partial<Byte>) => {
    setBytes((prevBytes) =>
      prevBytes.map((byte) =>
        byte.id === byteId ? { ...byte, ...updates } : byte
      )
    );
  }, []);

  return {
    bytes,
    isLoading,
    hasMore,
    loadMore,
    reset,
    updateByte,
  };
};
