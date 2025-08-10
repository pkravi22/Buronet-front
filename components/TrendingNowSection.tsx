// components/TrendingNowSection.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useTrendingTags } from '@/hooks/useTrendingTags';
import LoadingSpinner from './UI/LoadingSpinner';
import { FiTrendingUp, FiMoreHorizontal } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import CountFormatter from '@/components/countFormatter';

const TrendingNowSection = () => {
    const { tags, isLoading, isError } = useTrendingTags();

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading tags...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 text-red-500">
                <p>Error loading trending tags.</p>
            </div>
        );
    }

    if (tags.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 text-gray-500">
                <p>No tags available yet.</p>
            </div>
        );
    }
    const isHot = false

    return (
          <>
            {tags.map((tag, index) => (
            //     <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            //     <div className="flex items-center">
            //         {/* Replaced FaFire with a simple SVG */}
            //         <svg className="w-4 h-4 mr-2 text-[#EF4444]" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5.67s-.74 2.65-2.74 2.65c-2.01 0-2.81-2.65-2.81-2.65S3.5 3.99 2 5.46C.5 6.93 0 9.79 0 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-2.21-.5-5.07-2-6.54-1.5-1.47-4.5-4.79-4.5-4.79zM12 22c-3.31 0-6-2.69-6-6h2c0 2.21 1.79 4 4 4s4-1.79 4-4h2c0 3.31-2.69 6-6 6z" /></svg>
            //         <Link key={index} href={`/search?tag=${tag}`}>
            //         <span className="text-gray-700 text-sm font-medium">#{tag.tagName}</span>
            //         </Link> 
            // </div>
            // <span className="text-gray-500 text-xs">{tag.totalPosts} posts</span>
            // </div>
            <div className="bg-[#F9FAFD] rounded-xl p-3 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-[#6B728B] text-sm">#{tag.tagName}</span>
          {isHot && (
            <div className="ml-2 bg-[#FEE2E2] rounded px-2 py-0.5 flex items-center">
              <FaFire className="text-[#DC2626] w-2.5 h-3" />
              <span className="ml-1 text-[#DC2626] text-sm">Hot</span>
            </div>
          )}
        </div>
        <FiMoreHorizontal className="text-[#9CA3AF] w-3.5" />
      </div>
      <h3 className="text-[#1F2937] text-base font-medium mt-1 mb-2 leading-5">
        {tag.mostRecentPost.title}
      </h3>
      <p className="text-[#6B728B] text-sm">
        <CountFormatter count={tag.totalPosts} /> posts • <CountFormatter count={tag.postsLastWeek} /> new posts
        {/* {} • 1 new post */}
      </p>
    </div>
            ))}
        </>
    );
};

export default TrendingNowSection;