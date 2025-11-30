import { useState, useCallback } from 'react';
// import axios from 'axios'; // Use your existing axios instance
import {get} from "@/lib/api"
import { SearchResultDto } from '@/lib/types/search'; // Define these types on the frontend

interface UseSearchReturn {
  results: SearchResultDto;
  loading: boolean;
  error: string | null;
  executeSearch: (query: string) => void;
}

export const useSearch = (): UseSearchReturn => {
  const [results, setResults] = useState<SearchResultDto>({
    results: [],
    totalUserCount: 0,
    totalJobCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const executeSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults({ results: [], totalUserCount: 0, totalJobCount: 0 });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calls your new ASP.NET Core API endpoint
      const response = await get(`/search?q=${encodeURIComponent(query)}`);
      
      setResults(response as any);
    } catch (err) {
      console.error("Search failed:", err);
      setError('An error occurred during search. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, executeSearch };
};