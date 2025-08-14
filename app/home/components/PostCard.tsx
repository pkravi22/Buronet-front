// // components/PostCard.tsx
// 'use client';

// import React from 'react';
// import Image from 'next/image';
// import { PostDto } from '@/lib/types/post'; // Import PostDto
// import { formatDistanceToNow } from 'date-fns'; // For "2h ago" type formatting
// import { toZonedTime } from 'date-fns-tz';

// interface PostCardProps {
//   post: PostDto;
// }

// const PostCard: React.FC<PostCardProps> = ({ post }) => {
//   // Function to format time since post creation
//   const getTimeAgo = (dateString: string) => {
//     try {
//       if (!dateString) return 'N/A';
//       const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
//       const utcDate = new Date(dateString+"Z");
//       const localDate = toZonedTime(utcDate, userTimeZone);
//       return formatDistanceToNow(localDate, { addSuffix: true });
//     } catch {
//       return 'N/A';
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm">
//       <div className="px-4 py-6 sm:px-6">
//         {/* User Info */}
//         <div className="flex justify-between items-start">
//           <div className="flex">
//             <div className="w-12 h-12 shrink-0">
//               <Image
//                 src={post.user.profilePictureUrl || "/default-profile.png"} // Dynamic profile picture
//                 alt={`${post.user.firstName.charAt(0)} ${post.user.lastName.charAt(0)}` || "User"}
//                 width={48}
//                 height={48}
//                 className="rounded-lg object-cover object-top" // Ensure rounded corners and object fit
//               />
//             </div>
//             <div className="ml-4">
//               <div className="flex items-center flex-wrap">
//                 <h3 className="text-[#1F2937] font-medium text-base">{`${post.user.firstName} ${post.user.lastName}`}</h3> {/* Dynamic username */}
//                 {post.user.headline && ( // Dynamic headline (from UserProfile)
//                   <span className="ml-0 mt-1 sm:ml-2 sm:mt-0 text-[#2563EB] text-sm bg-[#EFF6FF] px-2 py-0.5 rounded-lg">
//                     {post.user.headline}
//                   </span>
//                 )}
//               </div>
//               <p className="text-[#6B7280] text-sm mt-1">
//                 {/* This part was "Senior Product Designer at TechCorp" in static.
//                     You might need to add a 'designation' or 'company' field to PostUserDto
//                     and map it in your backend if you want this dynamic.
//                     For now, using email as a dynamic placeholder. */}
//                 {post.user.email}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center text-[#9CA3AF] text-sm shrink-0 ml-2">
//             <span>{getTimeAgo(post.createdAt)}</span> {/* Dynamic time ago */}
//             <button className="ml-2 p-2 hover:bg-gray-50 rounded">
//               {/* Original SVG for options menu */}
//               <svg className="w-3.5 h-0.5" viewBox="0 0 14 4" fill="currentColor">
//                 <circle cx="2" cy="2" r="2" />
//                 <circle cx="7" cy="2" r="2" />
//                 <circle cx="12" cy="2" r="2" />
//               </svg>
//             </button>
//           </div>
//         </div>

//         {/* Post Content */}
//         <div className="mt-6">
//           <h4 className="text-[#1F2937] text-xl font-semibold leading-7">
//             {post.title} {/* Dynamic title */}
//           </h4>
//           <p className="mt-4 text-[#4B5563] text-base leading-6">
//             {post.content} {/* Dynamic content */}
//           </p>
//         </div>

//         {/* Post Image */}
//         {post.imageUrl && ( // Render image only if imageUrl exists
//           <div className="mt-6 bg-[#F9FAFB] rounded-lg p-2 sm:p-4">
//             <Image
//               src={post.imageUrl} // Dynamic image URL
//               alt={post.title}
//               width={560} // Use appropriate width/height for your images
//               height={373}
//               className="rounded-lg w-full h-auto" // Ensure rounded corners and full width
//             />
//           </div>
//         )}

//         {/* Post Actions: Like, Discuss, Bookmark, Share */}
//         <div className="mt-6 flex flex-wrap justify-between gap-4">
//           <div className="flex space-x-6">
//             {/* Like Button */}
//             <button className="flex items-center text-[#4B5563] text-sm">
//               {/* Original SVG for Like */}
//               <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 14 12" fill="currentColor">
//                 <path d="M7 12l-1.2-1.1C2.3 7.9 0 5.9 0 3.5 0 1.5 1.5 0 3.5 0 4.6 0 5.7 0.5 6.4 1.3L7 2l0.6-0.7C8.3 0.5 9.4 0 10.5 0 12.5 0 14 1.5 14 3.5c0 2.4-2.3 4.4-5.8 7.4L7 12z" />
//               </svg>
//               <span>Like ({post.likes.length})</span> {/* Dynamic like count */}
//             </button>
//             {/* Discuss Button */}
//             <button className="flex items-center text-[#4B5563] text-sm">
//               {/* Original SVG for Discuss */}
//               <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 14 12" fill="currentColor">
//                 <path d="M12 0H2C0.9 0 0 0.9 0 2V7C0 8.1 0.9 9 2 9H10L14 12V2C14 0.9 13.1 0 12 0Z" />
//               </svg>
//               <span>Discuss ({post.comments.length})</span> {/* Dynamic comment count */}
//             </button>
//           </div>
//           <div className="flex space-x-4">
//             {/* Bookmark Button */}
//             <button className="flex items-center text-[#4B5563] text-sm">
//               {/* Original SVG for Bookmark */}
//               <svg className="w-4 h-4 mr-2" viewBox="0 0 16 16" fill="currentColor">
//                 <path d="M2 2v12l6-3 6 3V2H2zm12-1H2C1.45 1 1 1.45 1 2v12c0 .55.45 1 1 1l6-3 6 3c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1z" />
//               </svg>
//               <span>Bookmark</span>
//             </button>
//             {/* Share Button */}
//             <button className="flex items-center text-[#4B5563] text-sm">
//               {/* Original SVG for Share */}
//               <svg className="w-4 h-3.5 mr-2" viewBox="0 0 16 14" fill="currentColor">
//                 <path d="M14 6L8 0V4C3 5 0 8 0 14C2 11 4 9.9 8 9.9V14L14 8L16 7L14 6Z" />
//               </svg>
//               <span>Share</span>
//             </button>
//           </div>
//         </div>

//         {/* Tags */}
//         {/* Tags */}
//         {post.tags && post.tags.length > 0 && ( // Render tags only if available
//           <div className="mt-6 flex flex-wrap gap-2">
//             {post.tags.map((tag, index) => (
//               <span key={index} className="bg-[#F3F4F6] text-[#4B5563] text-sm px-3 py-1 rounded-lg">
//                 #{tag}
//               </span>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PostCard;


// components/PostCard.tsx
// 'use client';

// import React, { useState } from 'react'; // Import useState
// import Image from 'next/image';
// import { PostDto, CommentDto, CommentRequestDto } from '@/lib/types/post'; // Import CommentRequestDto
// import { formatDistanceToNow } from 'date-fns';
// import { postApi, put } from '@/lib/api'; // Import post utility for API calls
// import { useAuth } from '@/context/AuthContext'; // To get current user ID for like/comment

// interface PostCardProps {
//   post: PostDto;
//   onPostUpdated?: (updatedPost: PostDto) => void; // Callback to update parent's post list
// }

// const PostCard: React.FC<PostCardProps> = ({ post: initialPost, onPostUpdated }) => {
//   // Use local state for post data to allow immediate UI updates for likes/comments
//   const { user } = useAuth(); // Get current authenticated user
//   const [post, setPost] = useState<PostDto>(initialPost);
//   const [commentInput, setCommentInput] = useState('');
//   const [showCommentInput, setShowCommentInput] = useState(false);
//   const [isLiking, setIsLiking] = useState(false);
//   const [isCommenting, setIsCommenting] = useState(false);

//   // Update local state if initialPost prop changes (e.g., from parent refetch)
//   React.useEffect(() => {
//     setPost(initialPost);
//   }, [initialPost]);

//   const getTimeAgo = (dateString: string) => {
//     try {
//       if (!dateString) return 'N/A';
//       return formatDistanceToNow(new Date(dateString), { addSuffix: true });
//     } catch {
//       return 'N/A';
//     }
//   };

//   const handleLikeToggle = async () => {
//     if (!user || isLiking) return; // Must be logged in and not already liking
//     console.log(`Toggling like for post ${post.id} by user ${user.id}`);
    
//     setIsLiking(true);
//     try {
//       // Call backend to toggle like
//       const res: { isLiked: boolean } = await postApi(`/posts/${post.id}/like`, {});

//       // Update local state immediately
//       setPost(prevPost => {
//         const newLikesCount = res.isLiked ? prevPost.likes.length + 1 : prevPost.likes.length - 1;
//         const updatedLikes = res.isLiked
//           ? [...prevPost.likes, { id: 0, postId: prevPost.id, userId: user.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { id: user.id, username: user.username, email: user.email } }] // Dummy like object for immediate UI
//           : prevPost.likes.filter(like => like.userId !== user.id);

//         return {
//           ...prevPost,
//           likes: updatedLikes, // Update the actual likes array
//           likesCount: newLikesCount,
//           isLikedByCurrentUser: res.isLiked,
//         };
//       });

//       // Optional: Notify parent component to refetch or update its list
//       onPostUpdated?.({ ...post, isLikedByCurrentUser: res.isLiked, likesCount: res.isLiked ? post.likes.length + 1 : post.likes.length - 1 });

//     } catch (err) {
//       console.error('Failed to toggle like:', err);
//       // Optionally revert UI state if API call failed
//     } finally {
//       setIsLiking(false);
//     }
//   };

//   const handleCommentSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!user || isCommenting || !commentInput.trim()) return;

//     setIsCommenting(true);
//     try {
//       const commentRequest: CommentRequestDto = { content: commentInput.trim() };
//       const newComment: CommentDto = await postApi(`/posts/${post.id}/comments`, commentRequest);

//       // Update local state immediately with the new comment
//       setPost(prevPost => ({
//         ...prevPost,
//         comments: [...prevPost.comments, newComment],
//         commentsCount: prevPost.commentsCount + 1,
//       }));
//       setCommentInput(''); // Clear input
//       setShowCommentInput(false); // Hide input after commenting

//       // Optional: Notify parent component to refetch or update its list
//       onPostUpdated?.({ ...post, commentsCount: post.comments.length + 1, comments: [...post.comments, newComment] });

//     } catch (err) {
//       console.error('Failed to add comment:', err);
//     } finally {
//       setIsCommenting(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm">
//       <div className="px-4 py-6 sm:px-6">
//         {/* User Info */}
//         <div className="flex justify-between items-start">
//           <div className="flex">
//             <div className="w-12 h-12 shrink-0">
//               <Image
//                 src={post.user.profilePictureUrl || "/default-profile.png"}
//                 alt={post.user.username || "User"}
//                 width={48}
//                 height={48}
//                 className="rounded-lg object-cover object-top"
//               />
//             </div>
//             <div className="ml-4">
//               <div className="flex items-center flex-wrap">
//                 <h3 className="text-[#1F2937] font-medium text-base">
//                   {post.user.firstName && post.user.lastName ? `${post.user.firstName} ${post.user.lastName}` : post.user.username}
//                 </h3>
//                 {post.user.headline && (
//                   <span className="ml-0 mt-1 sm:ml-2 sm:mt-0 text-[#2563EB] text-sm bg-[#EFF6FF] px-2 py-0.5 rounded-lg">
//                     {post.user.headline}
//                   </span>
//                 )}
//               </div>
//               <p className="text-[#6B7280] text-sm mt-1">
//                 {post.user.email}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center text-[#9CA3AF] text-sm shrink-0 ml-2">
//             <span>{getTimeAgo(post.createdAt)}</span>
//             <button className="ml-2 p-2 hover:bg-gray-50 rounded">
//               <svg className="w-3.5 h-0.5" viewBox="0 0 14 4" fill="currentColor">
//                 <circle cx="2" cy="2" r="2" />
//                 <circle cx="7" cy="2" r="2" />
//                 <circle cx="12" cy="2" r="2" />
//               </svg>
//             </button>
//           </div>
//         </div>

//         {/* Post Content */}
//         <div className="mt-6">
//           <h4 className="text-[#1F2937] text-xl font-semibold leading-7">
//             {post.title}
//           </h4>
//           <p className="mt-4 text-[#4B5563] text-base leading-6">
//             {post.content}
//           </p>
//         </div>

//         {/* Post Image */}
//         {post.imageUrl && (
//           <div className="mt-6 bg-[#F9FAFB] rounded-lg p-2 sm:p-4">
//             <Image
//               src={post.imageUrl}
//               alt={post.title}
//               width={560}
//               height={373}
//               className="rounded-lg w-full h-auto"
//             />
//           </div>
//         )}

//         {/* Post Actions: Like, Discuss, Bookmark, Share */}
//         <div className="mt-6 flex flex-wrap justify-between gap-4">
//           <div className="flex space-x-6">
//             {/* Like Button */}
//             <button
//               onClick={() => handleLikeToggle()}
//               className={`flex items-center text-sm ${post.isLikedByCurrentUser ? 'text-blue-600 font-medium' : 'text-[#4B5563]'} ${isLiking ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600'}`}
              
//             >
//               <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 14 12" fill="currentColor">
//                 <path d="M7 12l-1.2-1.1C2.3 7.9 0 5.9 0 3.5 0 1.5 1.5 0 3.5 0 4.6 0 5.7 0.5 6.4 1.3L7 2l0.6-0.7C8.3 0.5 9.4 0 10.5 0 12.5 0 14 1.5 14 3.5c0 2.4-2.3 4.4-5.8 7.4L7 12z" />
//               </svg>
//               <span>Like ({post.likesCount})</span> {/* Use likesCount from DTO */}
//             </button>
//             {/* Discuss Button */}
//             <button
//               onClick={() => setShowCommentInput(prev => !prev)} // Toggle comment input visibility
//               className="flex items-center text-[#4B5563] text-sm hover:text-blue-600"
//             >
//               <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 14 12" fill="currentColor">
//                 <path d="M12 0H2C0.9 0 0 0.9 0 2V7C0 8.1 0.9 9 2 9H10L14 12V2C14 0.9 13.1 0 12 0Z" />
//               </svg>
//               <span>Discuss ({post.commentsCount})</span> {/* Use commentsCount from DTO */}
//             </button>
//           </div>
//           <div className="flex space-x-4">
//             {/* Bookmark Button */}
//             <button className="flex items-center text-[#4B5563] text-sm hover:text-blue-600">
//               <svg className="w-4 h-4 mr-2" viewBox="0 0 16 16" fill="currentColor">
//                 <path d="M2 2v12l6-3 6 3V2H2zm12-1H2C1.45 1 1 1.45 1 2v12c0 .55.45 1 1 1l6-3 6 3c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1z"/>
//               </svg>
//               <span>Bookmark</span>
//             </button>
//             {/* Share Button */}
//             <button className="flex items-center text-[#4B5563] text-sm hover:text-blue-600">
//               <svg className="w-4 h-3.5 mr-2" viewBox="0 0 16 14" fill="currentColor">
//                 <path d="M14 6L8 0V4C3 5 0 8 0 14C2 11 4 9.9 8 9.9V14L14 8L16 7L14 6Z" />
//               </svg>
//               <span>Share</span>
//             </button>
//           </div>
//         </div>

//         {/* Tags */}
//         {post.tags && post.tags.length > 0 && (
//           <div className="mt-6 flex flex-wrap gap-2">
//             {post.tags.map((tag, index) => (
//               <span key={index} className="bg-[#F3F4F6] text-[#4B5563] text-sm px-3 py-1 rounded-lg">
//                 #{tag}
//               </span>
//             ))}
//           </div>
//         )}

//         {/* Comment Input Section */}
//         {showCommentInput && (
//           <div className="mt-4 pt-4 border-t border-gray-200">
//             <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
//               <input
//                 type="text"
//                 value={commentInput}
//                 onChange={(e) => setCommentInput(e.target.value)}
//                 placeholder="Write a comment..."
//                 className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//                 disabled={isCommenting}
//               />
//               <button
//                 type="submit"
//                 className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
//                 disabled={isCommenting || !commentInput.trim()}
//               >
//                 {isCommenting ? 'Posting...' : 'Post'}
//               </button>
//             </form>
//           </div>
//         )}

//         {/* Display Comments (Optional: You might want a separate component for this) */}
//         {post.comments.length > 0 && (
//           <div className="mt-4 pt-4 border-t border-gray-200">
//             <h5 className="text-sm font-medium text-gray-700 mb-2">Comments ({post.comments.length})</h5>
//             <div className="space-y-3">
//               {post.comments.map(comment => (
//                 <div key={comment.id} className="bg-gray-50 p-3 rounded-lg text-sm">
//                   <div className="flex items-center mb-1">
//                     <span className="font-semibold text-gray-800">{comment.user.firstName}</span>
//                     <span className="text-gray-500 text-xs ml-2">{getTimeAgo(comment.createdAt)}</span>
//                   </div>
//                   <p className="text-gray-700">{comment.content}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PostCard;

// components/PostCard.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { PostDto, CommentDto, CommentRequestDto } from '@/lib/types/post';
import { formatDistanceToNow } from 'date-fns';
import { postApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { PollOptionDto } from '@/lib/types/post'; // Import Poll DTOs

interface PostCardProps {
  post: PostDto;
  onPostUpdated?: (updatedPost: PostDto) => void;
  currentUserId: string | null;
  onDelete: (postId: number) => Promise<void>;
}

const PostCard: React.FC<PostCardProps> = ({ post: initialPost, onPostUpdated, currentUserId, onDelete }) => {
  const { user } = useAuth();
  const [post, setPost] = useState<PostDto>(initialPost);
  const [commentInput, setCommentInput] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isVoting, setIsVoting] = useState(false); // New state for voting

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  const getTimeAgo = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'N/A';
    }
  };

  const handleLikeToggle = async () => {
    if (!user || isLiking) return;
    console.log(`Toggling like for post ${post.id} by user ${user.id}`);

    setIsLiking(true);
    try {
      const res: { isLiked: boolean } = await postApi(`/posts/${post.id}/toggle-like`, {});

      setPost(prevPost => {
        const newLikesCount = res.isLiked ? prevPost.likesCount + 1 : prevPost.likesCount - 1;
        const updatedLikes = res.isLiked
          ? [...prevPost.likes, { id: 0, postId: prevPost.id, userId: user.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { id: user.id, username: user.username, email: user.email } }]
          : prevPost.likes.filter(like => like.userId !== user.id);

        return {
          ...prevPost,
          likes: updatedLikes,
          likesCount: newLikesCount,
          isLikedByCurrentUser: res.isLiked,
        };
      });

      onPostUpdated?.({ ...post, isLikedByCurrentUser: res.isLiked, likesCount: res.isLiked ? post.likesCount + 1 : post.likesCount - 1 });

    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isCommenting || !commentInput.trim()) return;

    setIsCommenting(true);
    try {
      const commentRequest: CommentRequestDto = { content: commentInput.trim() };
      const newComment: CommentDto = await postApi(`/posts/${post.id}/comments`, commentRequest);

      setPost(prevPost => ({
        ...prevPost,
        comments: [...prevPost.comments, newComment],
        commentsCount: prevPost.commentsCount + 1,
      }));
      setCommentInput('');
      setShowCommentInput(false);

      onPostUpdated?.({ ...post, commentsCount: post.commentsCount + 1, comments: [...post.comments, newComment] });

    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsCommenting(false);
    }
  };

  // --- NEW: Poll Vote Handler ---
  const handlePollVote = async (optionId: number) => {
    if (!user || isVoting || !post.isPoll || !post.poll) return;

    setIsVoting(true);
    try {
      // Call the backend endpoint to vote on the poll
      const updatedOption: PollOptionDto = await postApi(`/polls/${post.poll.id}/vote/${optionId}`, {});

      // Update the local state to reflect the vote and show results
      setPost(prevPost => {
        if (!prevPost.poll) return prevPost;

        const updatedOptions = prevPost.poll.options.map(option =>
          option.id === updatedOption.id
            ? { ...updatedOption, hasVoted: true, votes: option.votes + 1 }
            : option
        );
        const totalVotes = prevPost.poll.totalVotes + 1;

        return {
          ...prevPost,
          poll: {
            ...prevPost.poll,
            options: updatedOptions,
            totalVotes,
          }
        };
      });
      // Optionally notify parent to update its state
      onPostUpdated?.({...post});
    } catch (err) {
      console.error('Failed to vote on poll:', err);
      setError('Failed to vote on poll.');
    } finally {
      setIsVoting(false);
    }
  };
  // --- END NEW ---

  // Menu logic functions
  const handleMenuToggle = () => {
    setShowMenu((prev) => !prev);
  };

  const handleEditClick = () => {
    setShowMenu(false);
  };

  const handleOpenClick = () => {
    setShowMenu(false);
  };

  const handleDeleteClick = async () => {
    setShowMenu(false);
    if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      await onDelete(post.id);
    }
  };

  // Effect to close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const isPostOwner = currentUserId === post.userId;


  return (
    <div className="bg-white rounded-xl shadow-sm relative">
      <div className="px-4 py-6 sm:px-6">
        {/* User Info and Three-dot menu */}
        <div className="flex justify-between items-start">
          <div className="flex">
            <div className="w-12 h-12 shrink-0">
              <Image
                src={post.user?.profilePictureUrl || "/default-profile.png"}
                // alt={post.user?.username || "User"}
                width={48}
                height={48}
                className="rounded-lg object-cover object-top"
              />
            </div>
            <div className="ml-4">
              <div className="flex items-center flex-wrap">
                <h3 className="text-[#1F2937] font-medium text-base">
                  {post.user?.firstName && post.user?.lastName ? `${post.user.firstName} ${post.user.lastName}` : post.user?.username || "N/A"}
                </h3>
                {post.user?.headline && (
                  <span className="ml-0 mt-1 sm:ml-2 sm:mt-0 text-[#2563EB] text-sm bg-[#EFF6FF] px-2 py-0.5 rounded-lg">
                    {post.user.headline}
                  </span>
                )}
              </div>
              <p className="text-[#6B7280] text-sm mt-1">
                {post.user?.email || "N/A"}
              </p>
            </div>
          </div>
          
          {/* Three-dot menu and popup */}
          <div className="flex items-center text-[#9CA3AF] text-sm shrink-0 ml-2 relative">
            <span>{getTimeAgo(post.createdAt)}</span>
            {isPostOwner && (
              <div ref={menuRef}>
                <button
                  onClick={handleMenuToggle}
                  className="ml-2 p-2 hover:bg-gray-50 rounded"
                  aria-label="Post options"
                >
                  <svg className="w-3.5 h-0.5" viewBox="0 0 14 4" fill="currentColor">
                    <circle cx="2" cy="2" r="2" />
                    <circle cx="7" cy="2" r="2" />
                    <circle cx="12" cy="2" r="2" />
                  </svg>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <Link
                      href={`/posts/${post.id}`}
                      onClick={handleOpenClick}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i className="fas fa-eye mr-2"></i> Open
                    </Link>
                    <Link
                      href={`/posts/${post.id}/edit`}
                      onClick={handleEditClick}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i className="fas fa-edit mr-2"></i> Edit
                    </Link>
                    <button
                      onClick={handleDeleteClick}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <i className="fas fa-trash-alt mr-2"></i> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="mt-6">
          <h4 className="text-[#1F2937] text-xl font-semibold leading-7">
            {post.title}
          </h4>
          {/* --- NEW: Conditional Poll/Content Rendering --- */}
          {post.isPoll && post.poll ? (
            <div className="mt-4 space-y-3">
              <p className="text-[#4B5563] text-base leading-6">{post.content}</p>
              {post.poll.options.map((option, index) => {
                const hasVoted = option.hasVoted;
                const showResults = post.poll!.totalVotes > 0 && (hasVoted || isPostOwner); // Show results if voted or if post owner
                const percentage = showResults ? (option.votes / post.poll!.totalVotes) * 100 : 0;

                return (
                  <div key={option.id} className="relative">
                    <button
                      onClick={() => handlePollVote(option.id)}
                      className={`relative w-full p-3 border rounded-lg text-sm text-left transition-colors duration-200
                        ${hasVoted ? 'bg-blue-100 border-blue-400 text-blue-800 font-semibold' :
                          'bg-gray-50 border-gray-300 text-gray-800 hover:bg-gray-100'}
                        ${isVoting || hasVoted ? 'cursor-not-allowed' : ''}`}
                      disabled={isVoting || hasVoted}
                    >
                      <span className="absolute inset-y-0 left-0 bg-blue-200 transition-width duration-500 rounded-l-lg" style={{ width: `${percentage}%` }}></span>
                      <span className="relative z-10 flex justify-between items-center">
                        <span>{option.text}</span>
                        {showResults && (
                          <span className={`${hasVoted ? 'text-blue-800' : 'text-gray-700'} font-semibold ml-2`}>
                            {option.votes} ({percentage.toFixed(0)}%)
                          </span>
                        )}
                      </span>
                    </button>
                  </div>
                );
              })}
              {post.poll.totalVotes > 0 && (
                <p className="text-sm text-gray-500 mt-2 text-right">{post.poll.totalVotes} total votes</p>
              )}
            </div>
          ) : (
            <>
              <p className="mt-4 text-[#4B5563] text-base leading-6">{post.content}</p>
              {post.imageUrl && (
                <div className="mt-6 bg-[#F9FAFB] rounded-lg p-2 sm:p-4">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={560}
                    height={373}
                    className="rounded-lg w-full h-auto"
                  />
                </div>
              )}
            </>
          )}
          {/* --- END NEW --- */}
        </div>

        {/* Post Actions: Like, Discuss, Bookmark, Share */}
        <div className="mt-6 flex flex-wrap justify-between gap-4">
          <div className="flex space-x-6">
            {/* Like Button */}
            <button
              onClick={handleLikeToggle}
              className={`flex items-center text-sm ${post.isLikedByCurrentUser ? 'text-blue-600 font-medium' : 'text-[#4B5563]'} ${isLiking ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600'}`}
              disabled={isLiking || !user}
            >
              <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 14 12" fill="currentColor">
                <path d="M7 12l-1.2-1.1C2.3 7.9 0 5.9 0 3.5 0 1.5 1.5 0 3.5 0 4.6 0 5.7 0.5 6.4 1.3L7 2l0.6-0.7C8.3 0.5 9.4 0 10.5 0 12.5 0 14 1.5 14 3.5c0 2.4-2.3 4.4-5.8 7.4L7 12z" />
              </svg>
              <span>Like ({post.likesCount})</span>
            </button>
            {/* Discuss Button - Toggles comment input */}
            <button
              onClick={() => setShowCommentInput(prev => !prev)}
              className="flex items-center text-[#4B5563] text-sm hover:text-blue-600"
            >
              <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 14 12" fill="currentColor">
                <path d="M12 0H2C0.9 0 0 0.9 0 2V7C0 8.1 0.9 9 2 9H10L14 12V2C14 0.9 13.1 0 12 0Z" />
              </svg>
              <span>Discuss ({post.commentsCount})</span>
            </button>
          </div>
          <div className="flex space-x-4">
            {/* Bookmark Button */}
            <button className="flex items-center text-[#4B5563] text-sm hover:text-blue-600">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2v12l6-3 6 3V2H2zm12-1H2C1.45 1 1 1.45 1 2v12c0 .55.45 1 1 1l6-3 6 3c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1z"/>
              </svg>
              <span>Bookmark</span>
            </button>
            {/* Share Button */}
            <button className="flex items-center text-[#4B5563] text-sm hover:text-blue-600">
              <svg className="w-4 h-3.5 mr-2" viewBox="0 0 16 14" fill="currentColor">
                <path d="M14 6L8 0V4C3 5 0 8 0 14C2 11 4 9.9 8 9.9V14L14 8L16 7L14 6Z" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span key={index} className="bg-[#F3F4F6] text-[#4B5563] text-sm px-3 py-1 rounded-lg">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Comment Input Section */}
        {showCommentInput && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                disabled={isCommenting || !user}
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                disabled={isCommenting || !commentInput.trim() || !user}
              >
                {isCommenting ? 'Posting...' : 'Post'}
              </button>
            </form>
            {/* Display Comments */}
            {post.comments.length > 0 && (
              <div className="mt-4 space-y-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Comments ({post.commentsCount})</h5>
                {post.comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="flex items-center mb-1">
                      {/* Display commenter's profile picture */}
                      <img
                        src={comment.user?.avatar || "/default-profile.png"}
                        alt={comment.user?.username || "Commenter"}
                        width={24}
                        height={24}
                        className="rounded-full object-cover mr-2"
                      />
                      <span className="font-semibold text-gray-800">{comment.user?.username || "Unknown"}</span>
                      <span className="text-gray-500 text-xs ml-2">{getTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
