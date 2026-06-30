// hooks/useNews.ts
'use client';

import { useState, useEffect } from 'react';
import { parseUtcDateTime } from '@/lib/dates';

// Define the type for a single news article, based on the NewsAPI response structure.
export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string; // ISO 8601 date string
  content: string;
}

interface UseNewsResult {
  articles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useNews = (query: string): UseNewsResult => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      if (!query) {
        setError('Query is required.');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/next-api/updates?query=${encodeURIComponent(query)}&limit=20`);
        if (!response.ok) {
          let errorText = `API Error: ${response.status}`;
          try {
            const text = await response.text();
            if (text) {
              try {
                const errorData = JSON.parse(text);
                errorText = errorData.error || errorData.message || errorText;
              } catch (e) {
                errorText = `${errorText} - ${text.substring(0, 100)}`;
              }
            }
          } catch (e) {
            // Ignore text reading errors
          }
          throw new Error(errorText);
        }
        
        let data;
        try {
          data = await response.json();
        } catch (e) {
           throw new Error('Failed to parse API response as JSON.');
        }
        if (data && data.articles && Array.isArray(data.articles)) {
          const sortedArticles = data.articles.sort((a: any, b: any) => {
            const bTime = parseUtcDateTime(b.publishedAt)?.getTime() ?? 0;
            const aTime = parseUtcDateTime(a.publishedAt)?.getTime() ?? 0;
            return bTime - aTime;
          });
          setArticles(sortedArticles);
        } else {
          throw new Error('Invalid data format received from API.');
        }
      } catch (err: any) {
        console.error(`Error fetching news for query "${query}":`, err);
        setError(err.message || 'Failed to fetch news.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [query, fetchTrigger]);

  const refetch = () => {
    setFetchTrigger(prev => prev + 1);
  };

  return { articles, isLoading, error, refetch };
};
