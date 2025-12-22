// app/posts/[id]/edit/page.tsx
'use client'; // This component uses React hooks and needs client-side interactivity

import { useState, useEffect } from 'react'; // Only import what's directly used for hooks
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import React from 'react';

interface PostPageProps { // Or whatever your interface is named
  params: {
    id: string; 
  };
  searchParams?: { [key: string]: string | string[] | undefined }; 
}

// const NetworkCard: React.FC<NetworkCardProps> = ({ user, onConnectClick, isConnected }) => (
// Make the component function 'async' to use 'await' or React.use()
// const PostPage:React.FC<PostPageProps> = ({ id }) => {
const PostPage: React.FC<PostPageProps> = ({ params, searchParams }) => {
  // Use React.use() directly on params, as suggested by Next.js warning.
  // This satisfies the warning.
  // const resolvedParams = React.use(params);
  const postId = parseInt(params.id, 10); // Access id from the unwrapped object

  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth(); // Get current user profile from AuthContext
  const { getPostById, isLoading: isUpdatingPost, error: updateError } = usePosts();

  // Fetch the specific post data to pre-populate the form
  const { data: post, isLoading: isPostLoading, error: postFetchError } = getPostById(postId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const isLoading = isAuthLoading || isPostLoading || isUpdatingPost;
  const error = postFetchError || updateError;

  // Effect to populate form fields once post data is loaded
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setImageUrl(post.imageUrl || '');
    }
  }, [post]);

  // Redirect if user is not the owner of the post (after post loads)
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading post for editing...</span>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    console.error("Error loading/editing post:", error);
    return (
      <AppLayout>
        <div className="text-red-600 text-center py-8">
          <p>Error: {error.message || "An unexpected error occurred."}</p>
        </div>
      </AppLayout>
    );
  }

  if (!post) {
    return (
      <AppLayout>
        <div className="text-center py-8 text-gray-700">
          <p>Post not found or you do not have access.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 max-w-2xl pt-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">View Post</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form>
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
              <input
                type="text"
                id="title"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled
              />
            </div>
            <div className="mb-4">
              <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Content</label>
              <textarea
                id="content"
                className="form-textarea"
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled
              ></textarea>
            </div>
            {/* <div className="mb-6">
              <label htmlFor="imageUrl" className="block text-gray-700 text-sm font-bold mb-2">Image URL (Optional)</label>
              <input
                type="url"
                id="imageUrl"
                className="form-input"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled
              />
            </div> */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push(`/posts/${postId}`)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              {/* <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button> */}
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default PostPage;