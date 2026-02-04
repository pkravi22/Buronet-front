'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import TopBar from '@/components/TopBar';

import { UpdatePostDto } from '@/lib/types/post';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';
import Image from 'next/image';
import { FaArrowLeft } from 'react-icons/fa';
import '../../../restrictScroll.css';

interface EditPostPageProps {
  params: {
    id: string;
  };
}

const EditPostPage: React.FC<EditPostPageProps> = ({ params }) => {
  const postId = parseInt(params.id, 10);
  const router = useRouter();
  const { user, userProfile, isLoading: isAuthLoading } = useAuth();
  const { getPostById, updatePost, isLoading: isUpdatingPost, error: updateError } = usePosts();
  const { data: post, isLoading: isPostLoading, error: postFetchError } = getPostById(postId);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
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

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content);
      setImageUrl(post.imageUrl || '');
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post || isUpdatingPost) return;

    try {
      const updatedPost: UpdatePostDto = {
        title,
        content,
        imageUrl: imageUrl || null
      };
      await updatePost(postId, updatedPost);
      router.push(`/posts/${postId}`);
    } catch (err: any) {
      alert(`Failed to update post: ${err.message}`);
    }
  };

  const isLoading = isAuthLoading || isPostLoading || isUpdatingPost;

  if (isLoading && !post) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading...</span>
        </div>
      );
  }

  if (postFetchError) {
      return <div className="text-center p-8">Error loading post</div>;
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

              <div className="bg-white rounded-xl shadow-sm relative">
                <div className="px-4 py-6 sm:px-6">
                  {/* User Info Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex">
                      <div className="w-12 h-12 shrink-0">
                        <Image
                          src={getProfileImageUrl(userProfile?.profilePictureUrl)}
                          alt={userProfile?.firstName || "User"}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover object-top"
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-[#1F2937] font-medium text-base">
                          {userProfile?.firstName} {userProfile?.lastName}
                        </h3>
                        <p className="text-[#6B7280] text-sm mt-1">
                          Editing Post
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* Title Input */}
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2 hidden" htmlFor="title">Title</label>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title (optional)"
                        className="w-full text-xl font-semibold text-[#1F2937] placeholder-gray-400 border-none focus:ring-0 p-0 mb-2"
                      />
                    </div>

                    {/* Content Input */}
                    <div className="mb-4">
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What do you want to talk about?"
                        rows={6}
                        className="w-full text-[#4B5563] text-base leading-6 placeholder-gray-400 border-none focus:ring-0 resize-none p-0"
                        required
                      />
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdatingPost}
                        className="px-6 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium disabled:opacity-50"
                      >
                        {isUpdatingPost ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
        </main>
      </div>
    </div>
  );
};

export default EditPostPage;

