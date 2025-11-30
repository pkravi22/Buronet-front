// hooks/usePosts.ts
'use client'; // This is a client component

import useSWR, { mutate } from 'swr'; // Import useSWR and mutate for data fetching and cache management
import { apiFetch, get, postApi, put, remove } from '../lib/api'; // Your API utility helpers
import { useAuth } from '../context/AuthContext'; // To get current user ID for actions

// Import all necessary types from the consolidated 'user' types folder
import {
  PostDto, CreatePostDto, UpdatePostDto,
  CommentDto, CommentRequestDto // Need UserProfile for potential nested mapping (if PostDto includes it)
} from '../lib/types/post';

import { UserProfile } from '@/lib/types/user';

// SWR keys for posts endpoints
const ALL_POSTS_API_ROUTE = '/posts'; // For fetching all posts
const SINGLE_POST_API_ROUTE = (postId: number) => `/posts/${postId}`; // For fetching a single post

export function usePosts() {
  const { user: currentUserProfile, isLoading: isAuthLoading } = useAuth(); // Get current user's full profile from AuthContext

  // --- Fetching All Posts (Feed) ---
  // This useSWR call fetches the list of all posts.
  // It doesn't depend on currentUserProfile?.id to be triggered, as posts can be viewed by anyone.
  const { data: posts, error: postsError, isLoading: isPostsLoading } = useSWR<PostDto[]>(
    ALL_POSTS_API_ROUTE,
    get // Use the 'get' helper from lib/api.ts
  );

  // --- Actions for Posts ---

  const createPost = async (createDto: CreatePostDto) => {
    // Ensure user is authenticated before allowing post creation
    if (!currentUserProfile?.id) throw new Error("Authentication required to create a post.");
    try {
      console.log("createDto", createDto)
      // Send POST request to backend
      const newPost = await postApi<PostDto>(ALL_POSTS_API_ROUTE, createDto);
      
      // Optimistically update the list of posts in the SWR cache.
      // This makes the UI feel faster by adding the new post immediately.
      mutate(ALL_POSTS_API_ROUTE, (currentPosts: PostDto[] | undefined) => {
        // When creating, the backend should return a full PostDto including User & UserProfile.
        // We can confidently add it to the start of the list.
        return currentPosts ? [newPost, ...currentPosts] : [newPost];
      }, false); // 'false' tells SWR not to revalidate immediately after optimistic update

      // Revalidate in the background to confirm the data is consistent with the backend.
      mutate(ALL_POSTS_API_ROUTE);
      return newPost;
    } catch (err: any) {
      console.error("Failed to create post:", err);
      // If the API call fails, revert the optimistic update or force a revalidation.
      mutate(ALL_POSTS_API_ROUTE);
      throw err;
    }
  };

  const updatePost = async (postId: number, updateDto: UpdatePostDto) => {
    if (!currentUserProfile?.id) throw new Error("Authentication required to update a post.");
    try {
      // Send PUT request to backend
      const updatedPost = await put<PostDto>(SINGLE_POST_API_ROUTE(postId), updateDto);
      
      // Optimistically update the specific post in the SWR cache for the single post view
      mutate(SINGLE_POST_API_ROUTE(postId), updatedPost, false);
      
      // Optimistically update the post in the list of all posts (if it exists there)
      mutate(ALL_POSTS_API_ROUTE, (currentPosts: PostDto[] | undefined) => {
          return currentPosts?.map(p => p.id === postId ? { ...p, ...updatedPost } : p) || [];
      }, false);

      // Revalidate in the background
      mutate(SINGLE_POST_API_ROUTE(postId));
      mutate(ALL_POSTS_API_ROUTE);
      return updatedPost;
    } catch (err: any) {
      console.error("Failed to update post:", err);
      mutate(SINGLE_POST_API_ROUTE(postId)); // Revert or revalidate on error
      mutate(ALL_POSTS_API_ROUTE);
      throw err;
    }
  };

  const deletePost = async (postId: number) => {
    if (!currentUserProfile?.id) throw new Error("Authentication required to delete a post.");
    try {
      // Optimistically remove the post from the list of all posts
      mutate(ALL_POSTS_API_ROUTE, (currentPosts: PostDto[] | undefined) => {
        return currentPosts ? currentPosts.filter(p => p.id !== postId) : [];
      }, false);

      // Optimistically remove from single post cache
      mutate(SINGLE_POST_API_ROUTE(postId), null, false); // Set data to null to remove from cache

      // Send DELETE request to backend
      await remove(SINGLE_POST_API_ROUTE(postId));

      mutate(ALL_POSTS_API_ROUTE); // Revalidate in background
      mutate(SINGLE_POST_API_ROUTE(postId)); // Revalidate single post (confirms deletion)
    } catch (err: any) {
      console.error("Failed to delete post:", err);
      mutate(ALL_POSTS_API_ROUTE); // Revert or revalidate on error
      mutate(SINGLE_POST_API_ROUTE(postId));
      throw err;
    }
  };

  // --- Fetching Single Post ---
  // This function returns an SWR hook for a specific post ID.
  // Useful for /posts/[id]/page.tsx and /posts/[id]/edit/page.tsx
  const getPostById = (postId: number) => {
    return useSWR<PostDto>(
      postId ? SINGLE_POST_API_ROUTE(postId) : null, // Only fetch if postId is valid
      get // Use the 'get' helper
    );
  };

  // --- Post Interactions ---

  const toggleLike = async (postId: number) => {
    if (!currentUserProfile?.id) throw new Error("Authentication required to like/unlike a post.");
    try {
      // Optimistically update like count and status in both ALL_POSTS and SINGLE_POST caches
      mutate(ALL_POSTS_API_ROUTE, (currentPosts: PostDto[] | undefined) => {
        return currentPosts?.map(p => p.id === postId ? {
          ...p,
          likesCount: p.isLikedByCurrentUser ? p.likesCount - 1 : p.likesCount + 1,
          isLikedByCurrentUser: !p.isLikedByCurrentUser
        } : p) || [];
      }, false);
      mutate(SINGLE_POST_API_ROUTE(postId), (currentPost: PostDto | undefined) => {
        if (!currentPost) return currentPost;
        return {
          ...currentPost,
          likesCount: currentPost.isLikedByCurrentUser ? currentPost.likesCount - 1 : currentPost.likesCount + 1,
          isLikedByCurrentUser: !currentPost.isLikedByCurrentUser
        };
      }, false);

      // Send POST request to toggle like
      const response: { isLiked: boolean } = await postApi(`${SINGLE_POST_API_ROUTE(postId)}/like`, {});

      // Revalidate after backend confirms (optional, but good for accuracy)
      mutate(ALL_POSTS_API_ROUTE);
      mutate(SINGLE_POST_API_ROUTE(postId));
      return response.isLiked;
    } catch (err: any) {
      console.error("Failed to toggle like:", err);
      mutate(ALL_POSTS_API_ROUTE); // Revert optimistic update or revalidate on error
      mutate(SINGLE_POST_API_ROUTE(postId));
      throw err;
    }
  };

  const addComment = async (postId: number, createDto: CommentRequestDto) => {
    if (!currentUserProfile?.id) throw new Error("Authentication required to add a comment.");
    try {
      const newComment = await postApi<CommentDto>(`${SINGLE_POST_API_ROUTE(postId)}/comments`, createDto);

      // Optimistically add comment to single post view cache (if comments are loaded)
      mutate(SINGLE_POST_API_ROUTE(postId), (currentPost: PostDto | undefined) => {
        if (!currentPost) return currentPost;
        return {
          ...currentPost,
          commentsCount: currentPost.commentsCount + 1,
          comments: currentPost.comments ? [...currentPost.comments, newComment] : [] // Append only if comments array exists
        };
      }, false);
      // Optimistically update comment count in all posts view cache
      mutate(ALL_POSTS_API_ROUTE, (currentPosts: PostDto[] | undefined) => {
        return currentPosts?.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p) || [];
      }, false);

      mutate(ALL_POSTS_API_ROUTE); // Revalidate all posts
      mutate(SINGLE_POST_API_ROUTE(postId)); // Revalidate single post (to get full comment data and user info)
      return newComment;
    } catch (err: any) {
      console.error("Failed to add comment:", err);
      mutate(ALL_POSTS_API_ROUTE);
      mutate(SINGLE_POST_API_ROUTE(postId));
      throw err;
    }
  };

  const deleteComment = async (commentId: number, postId: number) => {
    if (!currentUserProfile?.id) throw new Error("Authentication required to delete a comment.");
    try {
      // Optimistically remove comment from single post view cache (if comments are loaded)
      mutate(SINGLE_POST_API_ROUTE(postId), (currentPost: PostDto | undefined) => {
        if (!currentPost) return currentPost;
        return {
          ...currentPost,
          commentsCount: currentPost.commentsCount - 1,
          comments: currentPost.comments?.filter(c => c.id !== commentId) // Filter if comments array exists
        };
      }, false);
      // Optimistically update comment count in all posts view cache
      mutate(ALL_POSTS_API_ROUTE, (currentPosts: PostDto[] | undefined) => {
        return currentPosts?.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount - 1 } : p) || [];
      }, false);

      await remove(`${SINGLE_POST_API_ROUTE(postId)}/comments/${commentId}`);

      mutate(ALL_POSTS_API_ROUTE);
      mutate(SINGLE_POST_API_ROUTE(postId));
    } catch (err: any) {
      console.error("Failed to delete comment:", err);
      mutate(ALL_POSTS_API_ROUTE);
      mutate(SINGLE_POST_API_ROUTE(postId));
      throw err;
    }
  };


  return {
    posts: posts || [], // Return empty array if no posts yet
    isLoading: isPostsLoading,
    error: postsError,
    createPost,
    updatePost,
    deletePost,
    getPostById, // Expose function to get single post SWR hook
    toggleLike,
    addComment,
    deleteComment,
  };
}