// components/PostCard.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { PostDto, CommentDto, CommentRequestDto, PollOptionDto, LikeDto } from '@/lib/types/post';
import { postApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from "react-hot-toast";
import { useRouter } from 'next/navigation';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';
import { formatTimeAgo } from '@/lib/dates';

// --- NEW COMPONENT FOR POLLS ---
interface PollCardProps {
  poll: PostDto['poll'];
  isPostOwner: boolean;
  onVote: (optionId: number) => Promise<void>;
  isVoting: boolean;
  userHasVoted: boolean;
  content: string;
  user: any; // User object from AuthContext
}

const PollCard: React.FC<PollCardProps> = ({ poll, isPostOwner, onVote, isVoting, userHasVoted, content }) => {
  if (!poll) return null;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-[#4B5563] text-base leading-6">
        {content}
      </p>
      <div className="space-y-2 mt-4">
        {poll.options.map((option) => {
          const hasVoted = option.hasVoted;
          const showResults = poll.totalVotes > 0 && (hasVoted || isPostOwner);
          const percentage = showResults && poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;

          return (
            <div key={option.id} className="relative rounded-lg overflow-hidden">
              <button
                onClick={() => onVote(option.id)}
                className={`w-full p-4 border rounded-lg text-sm text-left transition-colors duration-200
                  ${hasVoted ? 'bg-blue-100 border-blue-400 text-blue-800 font-semibold' :
                    'bg-gray-50 border-gray-300 text-gray-800 hover:bg-gray-100'}
                  ${isVoting || hasVoted || userHasVoted ? 'cursor-not-allowed' : ''}`}
                disabled={isVoting || hasVoted || userHasVoted}
              >
                <div 
                  className="absolute inset-y-0 left-0 bg-blue-200 transition-width duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
                <div className="relative z-10 flex justify-between items-center">
                  <span>{option.text}</span>
                  {showResults && (
                    <span className={`${hasVoted ? 'text-blue-800' : 'text-gray-700'} font-semibold ml-2`}>
                      {option.votes} ({percentage.toFixed(0)}%)
                    </span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
      {poll.totalVotes > 0 && (
        <p className="text-sm text-gray-500 mt-2 text-right">{poll.totalVotes} total votes</p>
      )}
    </div>
  );
};
// --- END NEW COMPONENT ---

interface PostCardProps {
  post: PostDto;
  onPostUpdated?: (updatedPost: PostDto) => void;
  currentUserId: string | null;
  onDelete: (postId: number) => Promise<void>;
  hideOpenAction?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post: initialPost, onPostUpdated, currentUserId, onDelete, hideOpenAction }) => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const [post, setPost] = useState<PostDto>(initialPost);
  const [commentInput, setCommentInput] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const router = useRouter();

  const postUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/posts/${post.id}`
    : "";

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  const getTimeAgo = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      return formatTimeAgo(dateString);
    } catch {
      return 'N/A';
    }
  };

  const handleLikeToggle = async () => {
    if (!user || isLiking) return;

    setIsLiking(true);
    try {
      const res: { isLiked: boolean } = await postApi(`/posts/${post.id}/toggle-like`, {});

      setPost((prevPost): PostDto => {
        const newLikesCount = res.isLiked ? prevPost.likesCount + 1 : prevPost.likesCount - 1;
        const newLike: LikeDto = {
          id: 0,
          postId: prevPost.id,
          userId: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userEmail: user.email,
          userName: user.username
          // user: { id: user.id, username: user.username, email: user.email }
        };
        const updatedLikes: LikeDto[] = res.isLiked
          ? [...prevPost.likes, newLike]
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
  
  const handlePollVote = async (optionId: number) => {
    if (!user || isVoting || !post.isPoll || !post.poll) return;

    setIsVoting(true);
    try {
      // NOTE: This endpoint call is for a poll.
      const updatedOption: PollOptionDto = await postApi(`/posts/toggle-poll-vote`, { pollId: post.poll.id, pollOptionId: optionId, userId: user.id });

      setPost(prevPost => {
        if (!prevPost.poll) return prevPost;

        const updatedOptions = prevPost.poll.options.map(option =>
          option.id === updatedOption.id
            ? { ...option, hasVoted: true, votes: option.votes + 1 }
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
      onPostUpdated?.({...post});
    } catch (err) {
      console.error('Failed to vote on poll:', err);
    } finally {
      setIsVoting(false);
    }
  };

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

  const handleReportClick = () => {
    setShowMenu(false);
    setReportMessage('');
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (isReporting) return;
    setIsReporting(true);
    try {
      const data = await postApi<{ ok: boolean; error?: string; previewUrl?: string }>(
        '/posts/report-post',
        {
          postId: post.id,
          postUrl,
          message: reportMessage,
          reporter: user
            ? { id: user.id, email: user.email, username: user.username }
            : undefined,
        }
      );

      if (!data?.ok) {
        throw new Error(data?.error || 'Failed to send report');
      }

      setShowReportModal(false);
      toast.success('Report sent. Thanks for helping keep Buronet safe.');

      if (data?.previewUrl) {
        console.log('Report email preview URL:', data.previewUrl);
      }
    } catch (err: any) {
      console.error('Report failed:', err);
      toast.error(err?.message || 'Failed to send report');
    } finally {
      setIsReporting(false);
    }
  };

  const handleProfileClick = (refLink: string | undefined) => {
    if (!refLink) return;
    
    // Remove any leading slash from the prop, then add one back
    const cleanPath = "/profile/" + (refLink.startsWith('/') ? refLink.slice(1) : refLink);
    router.push(cleanPath);
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
  const userHasVoted = post.isPoll && post.poll?.options.some(opt => opt.hasVoted);

  console.log("post on post card:", post);

  return (
    <div className="bg-white rounded-xl shadow-sm relative">
      <div className="px-4 py-6 sm:px-6">
        {/* User Info and Three-dot menu */}
        <div className="flex justify-between items-start">
          <div className="flex">
            <div className="w-12 h-12 shrink-0">
              <Image
                src={getProfileImageUrl(post.user?.profilePictureUrl)}
                alt={post.user?.username || "User"}
                width={48}
                height={48}
                className="rounded-lg object-cover object-top"
              />
            </div>
            <div className="ml-4">
              <div className="flex items-center flex-wrap">
                <h3 className="text-[#1F2937] font-medium text-base cursor-pointer" onClick={() => handleProfileClick(post.userId)}>
                  {post.user?.firstName && post.user?.lastName ? `${post.user.firstName} ${post.user.lastName}` : post.user?.username || "N/A"}
                </h3>
                {post.user?.headline && (
                  <span className="ml-0 mt-1 sm:ml-2 sm:mt-0 text-[#2563EB] text-sm bg-[#EFF6FF] px-2 py-0.5 rounded-lg">
                    {post.user.headline}
                  </span>
                )}
              </div>
              <p className="text-[#6B7280] text-sm mt-1">
                {post.user?.username || "N/A"}
              </p>
            </div>
          </div>
          
          {/* Three-dot menu and popup */}
          <div className="flex items-center text-[#9CA3AF] text-sm shrink-0 ml-2 relative">
            <span>{getTimeAgo(post.createdAt)}</span>
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
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {/* Conditionally render "Open" link */}
                  {!hideOpenAction && (
                    <Link
                      href={`/posts/${post.id}`}
                      onClick={handleOpenClick}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i className="fas fa-eye mr-2"></i> Open
                    </Link>
                  )}

                  <button
                    onClick={handleReportClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i className="fas fa-flag mr-2"></i> Report
                  </button>

                  {isPostOwner && (
                    <>
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
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {showReportModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowReportModal(false);
            }}
          >
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Report Post</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 rounded hover:bg-gray-100 text-gray-600"
                  aria-label="Close report modal"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-4 space-y-3">
                <p className="text-sm text-gray-600">
                  This will email our moderators with the post link automatically.
                </p>
                <div className="text-xs text-gray-500 break-all">
                  <span className="font-medium text-gray-700">Post:</span> {postUrl}
                </div>
                <textarea
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                  className="w-full min-h-[120px] border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add details (what’s wrong with this post?)"
                  disabled={isReporting}
                />
              </div>

              <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                  disabled={isReporting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReport}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                  disabled={isReporting}
                >
                  {isReporting ? 'Sending…' : 'Send Report'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post Content */}
        <div className="mt-6">
          <h4 className="text-[#1F2937] text-xl font-semibold leading-7">
            {post.title}
          </h4>
          {post.isPoll && post.poll ? (
            <div className="mt-4 space-y-3">
              <p className="text-[#4B5563] text-base leading-6">{post.content}</p>
              {post.poll.options.map((option, index) => {
                
                const hasVoted = option.hasVoted;
                const showResults = post.poll!.totalVotes > 0 && (hasVoted || isPostOwner);
                const percentage = showResults ? (option.votes / post.poll!.totalVotes) * 100 : 0;
                console.log("showResults: ", showResults)
                console.log("percentage: ", percentage)
                return (
                  <div key={option.id} className="relative">
                    <button
                      onClick={() => handlePollVote(option.id)}
                      className={`relative w-full p-3 border rounded-lg text-sm text-left transition-colors duration-200
                        ${hasVoted ? 'bg-blue-100 border-blue-400 text-blue-800 font-semibold' :
                          'bg-gray-50 border-gray-300 text-gray-800 hover:bg-gray-100'}
                        ${isVoting || hasVoted || !user ? 'cursor-not-allowed' : ''}`}
                      disabled={isVoting || hasVoted || !user}
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
            {/* Bookmark Button
            <button className="flex items-center text-[#4B5563] text-sm hover:text-blue-600">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2v12l6-3 6 3V2H2zm12-1H2C1.45 1 1 1.45 1 2v12c0 .55.45 1 1 1l6-3 6 3c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1z"/>
              </svg>
              <span>Bookmark</span>
            </button> */}
            {/* Share Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center text-[#4B5563] text-sm hover:text-blue-600"
            >
              <svg className="w-4 h-3.5 mr-2" viewBox="0 0 16 14" fill="currentColor">
                <path d="M14 6L8 0V4C3 5 0 8 0 14C2 11 4 9.9 8 9.9V14L14 8L16 7L14 6Z" />
              </svg>
              <span>Share</span>
            </button>

          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span key={index} className="bg-[#F3F4F6] text-[#4B5563] text-sm px-3 py-1 rounded-lg">
                #{tag}
              </span>
            ))}
          </div>
        )}

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
            {post.comments.length > 0 && (
              <div className="mt-4 space-y-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Comments ({post.comments.length})</h5>
                {post.comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="flex items-center mb-1">
                      <img
                        src={getProfileImageUrl(comment.user?.profilePictureUrl)}
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
      {showShareModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    onClick={() => setShowShareModal(false)}
  >
    <div
      className="bg-white rounded-xl shadow-lg w-[90%] max-w-sm p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-2">
        Share this post
      </h3>

      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
        <input
          type="text"
          readOnly
          value={postUrl}
          className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(postUrl);
            toast.success("Link copied to clipboard");
          }}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Copy
        </button>
      </div>

      <button
        onClick={() => setShowShareModal(false)}
        className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700"
      >
        Close
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default PostCard;
