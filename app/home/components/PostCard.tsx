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

'use client';

import React, { useState, useEffect, useRef } from 'react'; // Import useEffect and useRef
import Image from 'next/image';
import { PostDto, CommentDto, CommentRequestDto } from '@/lib/types/post'; // IMPORTS REMAIN UNCHANGED AS PER INSTRUCTION
import { formatDistanceToNow } from 'date-fns';
import { postApi, put, remove } from '@/lib/api'; // IMPORTS REMAIN UNCHANGED AS PER INSTRUCTION (postApi/put might need attention later if undefined)
import { useAuth } from '@/context/AuthContext'; // IMPORTS REMAIN UNCHANGED AS PER INSTRUCTION
import Link from 'next/link'; // Import Link for navigation

interface PostCardProps {
  post: PostDto;
  onPostUpdated?: (updatedPost: PostDto) => void; // Callback to update parent's post list
  // ADDED: New props for delete (assuming edit will use Next.js Link)
  currentUserId: string | null; // Needed to check if user is owner
  onDelete: (postId: number) => Promise<void>; // New prop for delete action (will be passed from FeedPage)
  postsRefetchKey: number;
}

const PostCard: React.FC<PostCardProps> = ({ post: initialPost, onPostUpdated, currentUserId, onDelete }) => {
  const { user } = useAuth();
  const [post, setPost] = useState<PostDto>(initialPost);
  const [commentInput, setCommentInput] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  // ADDED: State and Ref for the three-dot menu
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); // Ref for detecting clicks outside the menu

  


  React.useEffect(() => {
    console.log("Posts", post);
    
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
      // NOTE: postApi is from your provided imports. Ensure it matches your lib/api.ts
      const res: { isLiked: boolean } = await postApi(`/posts/${post.id}/like`, {});

      setPost(prevPost => {
        // NOTE: This assumes prevPost.likes is an array. If backend PostDto doesn't include it, this will error.
        const newLikesCount = res.isLiked ? prevPost.likes.length + 1 : prevPost.likes.length - 1;
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

      onPostUpdated?.({ ...post, isLikedByCurrentUser: res.isLiked, likesCount: res.isLiked ? post.likes.length + 1 : post.likes.length - 1 });

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
      // NOTE: CommentRequestDto and postApi are from your provided imports.
      const commentRequest: CommentRequestDto = { content: commentInput.trim() };
      const newComment: CommentDto = await postApi(`/posts/${post.id}/comments`, commentRequest);

      // NOTE: This assumes prevPost.comments is an array. If backend PostDto doesn't include it, this will error.
      setPost(prevPost => ({
        ...prevPost,
        comments: [...prevPost.comments, newComment],
        commentsCount: prevPost.commentsCount + 1,
      }));
      setCommentInput('');
      setShowCommentInput(false);

      onPostUpdated?.({ ...post, commentsCount: post.comments.length + 1, comments: [...post.comments, newComment] });

    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsCommenting(false);
    }
  };

  // ADDED: Menu logic functions
  const handleMenuToggle = () => {
    setShowMenu((prev) => !prev);
  };

  const handleEditClick = () => {
    setShowMenu(false); // Close menu
    // Navigation to /posts/{id}/edit will be handled by the Link component directly
  };

  const handleOpenClick = () => {
    setShowMenu(false); // Close menu
    // Navigation to /posts/{id}/edit will be handled by the Link component directly
  };

  const handleDeleteClick = async () => {
    setShowMenu(false); // Close menu
    if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      // Call the onDelete prop passed from the parent (FeedPage)
      await onDelete(post.id);
    }
  };

  // ADDED: Effect to close menu when clicking outside
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

  // Determine if the current user is the owner of the post
  const isPostOwner = currentUserId === post.userId;


  return (
    <div className="bg-white rounded-xl shadow-sm relative"> {/* Added relative for menu positioning */}
      <div className="px-4 py-6 sm:px-6">
        {/* User Info and Three-dot menu */}
        <div className="flex justify-between items-start">
          <div className="flex">
            <div className="w-12 h-12 shrink-0">
              <Image
                src={post.user?.profilePictureUrl || "/default-profile.png"} // Using post.user?.profilePictureUrl
                alt={post.user?.username || "User"} // Using post.user?.username
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
                {post.user?.headline && ( // Using post.user?.headline
                  <span className="ml-0 mt-1 sm:ml-2 sm:mt-0 text-[#2563EB] text-sm bg-[#EFF6FF] px-2 py-0.5 rounded-lg">
                    {post.user.headline}
                  </span>
                )}
              </div>
              <p className="text-[#6B7280] text-sm mt-1">
                {post.user?.email || "N/A"} {/* Using post.user?.email */}
              </p>
            </div>
          </div>
          
          {/* Three-dot menu and popup - ADDED HERE */}
          <div className="flex items-center text-[#9CA3AF] text-sm shrink-0 ml-2 relative">
            <span>{getTimeAgo(post.createdAt)}</span>
            {!isPostOwner || true && ( // Only show menu button if current user is the owner
              <div ref={menuRef}> {/* Attach ref to the menu container */}
                <button
                  onClick={handleMenuToggle}
                  className="ml-2 p-2 hover:bg-gray-50 rounded"
                  aria-label="Post options"
                >
                  {/* Your three-dot SVG, or Font Awesome icon if globally available */}
                  {/* <i className="fas fa-ellipsis-h w-3.5 h-0.5"></i> */}
                  <svg className="w-3.5 h-0.5" viewBox="0 0 14 4" fill="currentColor">
                    <circle cx="2" cy="2" r="2" />
                    <circle cx="7" cy="2" r="2" />
                    <circle cx="12" cy="2" r="2" />
                  </svg>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <Link
                      href={`/posts/${post.id}`} // Navigate to edit page
                      onClick={handleOpenClick} // Close menu on click
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i className="fas fa-edit mr-2"></i> Open
                    </Link>
                    <Link
                      href={`/posts/${post.id}/edit`} // Navigate to edit page
                      onClick={handleEditClick} // Close menu on click
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i className="fas fa-edit mr-2"></i> Edit
                    </Link>
                    <button
                      onClick={handleDeleteClick} // Call delete handler
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
          <p className="mt-4 text-[#4B5563] text-base leading-6">
            {post.content}
          </p>
        </div>

        {/* Post Image */}
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

        {/* Post Actions: Like, Discuss, Bookmark, Share */}
        <div className="mt-6 flex flex-wrap justify-between gap-4">
          <div className="flex space-x-6">
            {/* Like Button */}
            <button
              onClick={() => handleLikeToggle()}
              className={`flex items-center text-sm ${post.isLikedByCurrentUser ? 'text-blue-600 font-medium' : 'text-[#4B5563]'} ${isLiking ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600'}`}
              disabled={isLiking}
            >
              <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 14 12" fill="currentColor">
                <path d="M7 12l-1.2-1.1C2.3 7.9 0 5.9 0 3.5 0 1.5 1.5 0 3.5 0 4.6 0 5.7 0.5 6.4 1.3L7 2l0.6-0.7C8.3 0.5 9.4 0 10.5 0 12.5 0 14 1.5 14 3.5c0 2.4-2.3 4.4-5.8 7.4L7 12z" />
              </svg>
              <span>Like ({post.likesCount})</span>
            </button>
            {/* Discuss Button - Now links to single post page for comments */}
            <button
              onClick={() => setShowCommentInput(prev => !prev)} // Toggle comment input visibility
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
                <path d="M2 2v12l6-3 6 3V2H2zm12-1H2C1.45 1 1 1.45 1 2v12c0 .55.45 1 1 1l6-3 6 3c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1z" />
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
                disabled={isCommenting || !user} // Disable if not logged in
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                disabled={isCommenting || !commentInput.trim() || !user} // Disable if not logged in
              >
                {isCommenting ? 'Posting...' : 'Post'}
              </button>
            </form>
            {/* Display Comments */}
            {post.comments.length > 0 && (
              <div className="mt-4 space-y-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Comments ({post.comments.length})</h5>
                {post.comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="flex items-center mb-1">
                      {/* Display commenter's profile picture */}
                      <img
                        src={comment.user?.avatar || "/default-profile.png"}
                        alt={comment.user?.username.charAt(0) || "??"}
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

        {/* Removed Comment Input and Display sections (as per FeedPage optimization) */}
        {/* These functionalities are best handled on the dedicated single post page (app/posts/[id]/page.tsx) */}
      </div>
    </div>
  );
};

export default PostCard;