// app/current-affairs/page.tsx
'use client';

import React from 'react';
import TopBar from '../../components/TopBar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { withAuthRequired } from '../../context/AuthContext';
import Image from 'next/image';
import { useNews } from '@/hooks/useNews';
import { formatTimeAgo } from '@/lib/dates';

const PageShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-h-screen flex flex-col bg-[#EEF0F4] pb-6 mb-12 sm:mb-0">
      <TopBar />
      <div className="flex flex-col lg:flex-row flex-1 pt-[80px]">
        <div className="hidden lg:block w-[20%] ml-6 xl:w-[270px] desktop:w-[260px] left-6 shrink-0" />
        <Navbar activeItem="Home" />
        <main className="flex-1 px-4 sm:px-6 lg:mx-1 overflow-y-auto h-[calc(100vh-100px)] scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            {children}
            <div className="lg:hidden h-20" />
          </div>
        </main>
        <div className="fixed h-[21px] lg:hidden"></div>
      </div>
    </div>
  );
};

const CurrentAffairsPage: React.FC = () => {
  // Use the new hook with a specific query for "india exams"
  const { articles, isLoading, error, refetch } = useNews('government jobs india');

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-center items-center h-[calc(100vh-160px)]">
          <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading latest news...</span>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="text-red-600 text-center py-8 px-4">
          <p>Error loading latest news: {error}</p>
          <p className="mt-4 text-gray-700 text-sm">Please check your network and API key configuration.</p>
          <button onClick={refetch} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Retry</button>
        </div>
      </PageShell>
    );
  }

  if (articles.length === 0) {
    return (
      <PageShell>
        <div className="text-center py-8 text-gray-700 px-4">
          <p>No news available at this time.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
        Latest News from India
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {articles.map((item) => (
          <div key={item.url} className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow flex flex-col overflow-hidden">
            {item.urlToImage && (
              <div className="relative w-full h-48">
                <Image
                  src={item.urlToImage}
                  alt={item.title}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}
            <div className="p-4 sm:p-6 flex flex-col flex-grow">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight mb-3 sm:mb-4 line-clamp-2">
                {item.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-500 text-sm mb-3 sm:mb-4">
                <p>Source: {item.source.name}</p>
                <span className="hidden sm:inline">&middot;</span>
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
    </PageShell>
  );
};

export default withAuthRequired(CurrentAffairsPage);
