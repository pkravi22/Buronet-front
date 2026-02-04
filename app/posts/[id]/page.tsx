'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import TopBar from '@/components/TopBar';
import PostCard from '@/app/home/components/PostCard';
import { remove } from '@/lib/api';
import { FaArrowLeft } from 'react-icons/fa';
import '../../restrictScroll.css';

interface PostPageProps {
  params: {
    id: string;
  };
}

const PostPage: React.FC<PostPageProps> = ({ params }) => {
  const postId = parseInt(params.id, 10);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { getPostById } = usePosts();
  const { data: post, isLoading: isPostLoading, error: postFetchError } = getPostById(postId);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (user) {
      root.classList.add('restrict-scroll');
      body.classList.add('restrict-scroll');
    } else {
      root.classList.remove('restrict-scroll');
      body.classList.remove('restrict-scroll');
    }

    return () => {
      root.classList.remove('restrict-scroll');
      body.classList.remove('restrict-scroll');
    };
  }, [user]);

  const handleDeletePost = async (id: number) => {
    if (!user) return;
    try {
      await remove(`/posts/${id}`);
      router.push('/home');
    } catch (err: any) {
      console.error(`Failed to delete post ${id}:`, err);
    }
  };

  if (isAuthLoading || isPostLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading...</span>
      </div>
    );
  }

  if (postFetchError || !post) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-red-600">Error loading post or post not found.</div>
      </div>
    );
  }

  return (
    <div className="max-h-screen flex flex-col bg-[#EEF0F4] pb-6 mb-12 sm:mb-0">
      <TopBar />
      <div className="flex flex-1 pt-[80px] justify-center">
        
        <main ref={mainRef} className="w-full max-w-[640px] px-4 sm:px-0 overflow-y-auto h-[calc(100vh-100px)] scrollbar-hide">
          <div className="mt-6 space-y-6">
              <button 
                onClick={() => router.back()} 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                <span>Back</span>
              </button>

              <PostCard
                post={post}
                currentUserId={user?.id || null}
                onDelete={handleDeletePost}
                hideOpenAction={true}
              />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PostPage;