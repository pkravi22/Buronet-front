// app/current-affairs/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import SiteLayout from '../../components/SiteLayout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useAuth, withAuthRequired } from '../../context/AuthContext';
import { formatDistanceToNow, parseISO } from 'date-fns';
import Image from 'next/image';
import { useNews } from '@/hooks/useNews';

const CurrentAffairsPage: React.FC = () => {
  // Use the new hook with a specific query for "india exams"
  const { articles, isLoading, error, refetch } = useNews('government jobs india');

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading latest news...</span>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="text-red-600 text-center py-8 px-4">
          <p>Error loading latest news: {error}</p>
          <p className="mt-4 text-gray-700 text-sm">Please check your network and API key configuration.</p>
          <button onClick={refetch} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Retry</button>
        </div>
      </AppLayout>
    );
  }

  if (articles.length === 0) {
    return (
      <AppLayout>
        <div className="text-center py-8 text-gray-700 px-4">
          <p>No news available at this time.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* <div className="min-h-screen bg-[#EEF0F4] mt-8 py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8"> */}
          <h1 className="text-3xl font-bold mb-8">
            Latest News from India
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((item) => (
              <div key={item.url} className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow flex flex-col">
                {item.urlToImage && (
                  <div className="relative w-full h-48 rounded-t-xl overflow-hidden">
                    <Image
                      src={item.urlToImage}
                      alt={item.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-4 line-clamp-2">
                    {item.title}
                  </h2>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <p>Source: {item.source.name}</p>
                    <span className="mx-2">&middot;</span>
                    <p>Published: {formatTimeAgo(item.publishedAt)}</p>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm mb-4 line-clamp-4">
                    {item.description}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center text-blue-600 hover:underline font-medium transition"
                  >
                    Read more
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        {/* </div>
      </div> */}
    </AppLayout>
  );
};

export default withAuthRequired(CurrentAffairsPage);
