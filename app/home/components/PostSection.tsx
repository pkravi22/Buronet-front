// components/PostSection.tsx
'use client';

import React from 'react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { usePosts } from '@/hooks/usePosts';
import PostCard from './PostCard';
import { remove } from '@/lib/api'; // Import the 'remove' utility for DELETE requests
import { useAuth } from '@/context/AuthContext'; // To get current user ID for delete permission

interface PostSectionProps {
  tag?: string; // Optional tag to filter posts
  postsRefetchKey: number; // Key from HomePage to force refetch
  filterType?: 'all' | 'mine';
}

const PostSection: React.FC<PostSectionProps> = ({ tag, postsRefetchKey, filterType = 'all' }) => {
  // const { posts, isLoading, isError, refetchPosts } = usePosts(tag);
  const { posts, isLoading, error } = usePosts(filterType);
  const isError = error;
  const { user } = useAuth(); // Get the current user for delete permission checks

  const handleDeletePost = async (postId: number) => {
    if (!user) {
      console.error("Delete Post: User not authenticated.");
      // Optionally show a message to the user
      return;
    }

    try {
      await remove(`/posts/${postId}`); // Call the backend DELETE endpoint
      console.log(`Post ${postId} deleted successfully.`);
      // refetchPosts(); // Refetch posts to update the list
    } catch (err: any) {
      console.error(`Failed to delete post ${postId}:`, err);
    }
  };

  // React.useEffect(() => {
  //   refetchPosts();
  // }, [postsRefetchKey, refetchPosts]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading posts...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-600 text-center py-8">
        <p>Error loading posts: {isError}</p>
        {/* <button onClick={refetchPosts} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Retry
        </button> */}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-gray-600 text-center py-8">
        <p>No posts available yet.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full px-4 sm:px-0">
      <div className="mt-6 w-full max-w-[640px] space-y-6">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={user?.id || null}
            // Pass current user ID for owner check
            onDelete={handleDeletePost} // <--- FIX: Pass the handleDeletePost function here
            // onPostUpdated={handlePostUpdated} // If you implement this callback for optimistic updates
          />
        ))}
      </div>
    </div>
  );
};

export default PostSection;
