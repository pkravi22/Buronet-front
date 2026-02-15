// app/trending/[tag]/page.tsx
'use client';

import React from 'react';
import TopBar from '@/components/TopBar';
import Navbar from '@/components/Navbar';
import { usePostsByTag } from '@/hooks/usePostsByTag';
import { useAuth } from '@/context/AuthContext';
import { remove } from '@/lib/api';
import PostCard from '@/app/home/components/PostCard';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter, useParams } from 'next/navigation';

export default function TagPostsPage() {
  const { tag } = useParams<{ tag: string }>();
  const decodedTag = decodeURIComponent(tag);
  const { posts, isLoading, isLoadingMore, error, hasMore, loadMore } = usePostsByTag(decodedTag);
  const { user } = useAuth();
  const router = useRouter();

  const handleDeletePost = async (postId: number) => {
    if (!user) return;
    try {
      await remove(`/posts/${postId}`);
    } catch (err: any) {
      console.error(`Failed to delete post ${postId}:`, err);
    }
  };

  return (
    <div className="max-h-screen flex flex-col bg-[#EEF0F4] pb-6 mb-12 sm:mb-0">
      <TopBar />
      <div className="flex flex-col lg:flex-row flex-1 pt-[80px]">
        <div className="hidden lg:block w-[20%] ml-6 xl:w-[270px] desktop:w-[260px] left-6 shrink-0" />
        <Navbar activeItem="Home" />
        <main className="flex-1 px-4 sm:px-6 lg:mx-1 overflow-y-auto h-[calc(100vh-100px)] scrollbar-hide">
          <div className="flex justify-center w-full px-4 sm:px-0">
            <div className="mt-6 w-full max-w-[640px]">
              {/* Header */}
              <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <FiArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <div>
                    <h1 className="text-xl font-semibold text-[#1F2937]">
                      #{decodedTag}
                    </h1>
                    {!isLoading && posts.length > 0 && (
                      <p className="text-sm text-[#6B728B] mt-0.5">
                        Showing posts tagged with #{decodedTag}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Posts list */}
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner />
                  <span className="ml-2 text-gray-700">Loading posts...</span>
                </div>
              ) : error ? (
                <div className="text-red-600 text-center py-8">
                  <p>Error loading posts: {error}</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-gray-600 text-center py-8">
                  <p>No posts found for #{decodedTag}.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={user?.id || null}
                      onDelete={handleDeletePost}
                    />
                  ))}

                  {/* Load more */}
                  {hasMore && (
                    <div className="flex justify-center py-6">
                      <button
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        className="px-6 py-2.5 bg-white text-[#2563EB] font-medium rounded-lg border border-[#2563EB] hover:bg-[#EEF2FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingMore ? (
                          <span className="flex items-center gap-2">
                            <LoadingSpinner /> Loading...
                          </span>
                        ) : (
                          'Load more posts'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="lg:hidden h-20" />
        </main>
        <div className="fixed h-[21px] lg:hidden"></div>
      </div>
    </div>
  );
}
