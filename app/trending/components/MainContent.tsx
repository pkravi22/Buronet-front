"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { get } from '@/lib/api';
import { TagWithTotalCountDto } from '@/lib/types/post';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import CountFormatter from '@/components/countFormatter';
import { FiTrendingUp } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';

const TrendingTopicsPage = () => {
  const router = useRouter();
  const [tags, setTags] = useState<TagWithTotalCountDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      setIsError(null);
      try {
        const trendingTags = await get<TagWithTotalCountDto[]>('/posts/trending-tags?limit=20');
        setTags(trendingTags);
      } catch (err: any) {
        console.error('Error fetching trending tags:', err);
        setIsError(err.message || 'Failed to load trending tags.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTags();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner />
        <span className="ml-2 text-gray-700">Loading trending tags...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mt-4 text-red-500">
        <p>Error loading trending tags.</p>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mt-4 text-gray-500">
        <p>No trending tags available yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center mb-4">
        <FiTrendingUp className="text-[#00B4D8] w-6 h-6" />
        <h1 className="ml-2 text-xl font-bold text-[#1F2937]">Trending Now</h1>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tags.map((tag, index) => (
          <div
            key={`trending-tag-${index}`}
            className="bg-white rounded-xl p-4 cursor-pointer border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
            onClick={() => router.push(`/trending/${encodeURIComponent(tag.tagName)}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-[#00B4D8] font-semibold text-sm">#{tag.tagName}</span>
                {index < 3 && (
                  <div className="ml-2 bg-[#FEE2E2] rounded px-2 py-0.5 flex items-center">
                    <FaFire className="text-[#DC2626] w-2.5 h-3" />
                    <span className="ml-1 text-[#DC2626] text-xs font-medium">Hot</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400 font-medium">#{index + 1}</span>
            </div>
            {tag.mostRecentPost?.title && (
              <h3 className="text-[#1F2937] text-sm font-medium mt-2 leading-5 line-clamp-2">
                {tag.mostRecentPost.title}
              </h3>
            )}
            <p className="text-[#6B728B] text-xs mt-2">
              <CountFormatter count={tag.totalPosts} /> posts • <CountFormatter count={tag.postsLastWeek} /> new this week
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopicsPage;
