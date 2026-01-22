// hooks/useCurrentAffairs.ts
'use client';

import { useState, useEffect } from 'react';
import { parseUtcDateTime } from '@/lib/dates';

// Define the type for a single current affair item, based on the NewsAPI response structure.
export interface CurrentAffair {
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

interface UseCurrentAffairsResult {
    affairs: CurrentAffair[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useCurrentAffairs = (): UseCurrentAffairsResult => {
    const [affairs, setAffairs] = useState<CurrentAffair[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fetchTrigger, setFetchTrigger] = useState(0);

    const NEWS_API_KEY = "f6719dee71aa4664bca1082aa8e98438"; 

    useEffect(() => {
        const fetchNews = async () => {
            if (!NEWS_API_KEY) {
                setError('NewsAPI key is not configured. Please add your key to proceed.');
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            setError(null);

            const options = {
                method: 'GET',
                headers: {
                    'X-Api-Key': NEWS_API_KEY,
                },
            };

            try {
                const response = await fetch('https://newsapi.org/v2/everything?q=india exams&pageSize=20', options);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `API Error: ${response.status}`);
                }
                const data = await response.json();
                if (data && data.articles && Array.isArray(data.articles)) {
                    const sortedArticles = data.articles.sort((a:any, b:any) => {
                        const bTime = parseUtcDateTime(b.publishedAt)?.getTime() ?? 0;
                        const aTime = parseUtcDateTime(a.publishedAt)?.getTime() ?? 0;
                        return bTime - aTime;
                    });
                    setAffairs(sortedArticles);
                } else {
                    throw new Error('Invalid data format received from API.');
                }
            } catch (err: any) {
                console.error('Error fetching current affairs:', err);
                setError(err.message || 'Failed to fetch current affairs.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
    }, [NEWS_API_KEY, fetchTrigger]);

    const refetch = () => {
        setFetchTrigger(prev => prev + 1);
    }

    return { affairs, isLoading, error, refetch };
};