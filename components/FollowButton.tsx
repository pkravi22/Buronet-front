// components/FollowButton.tsx
// Reusable Follow / Following toggle button.
// Handles optimistic state internally — parent only needs to supply initial isFollowing state.
//
// Usage:
//   <FollowButton targetUserId="abc-123" initialIsFollowing={false} />
//   <FollowButton targetUserId="abc-123" initialIsFollowing={true} size="sm" />

'use client';

import { useState } from 'react';
import { useFollow } from '@/hooks/useFollow';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  /** sm = compact (icon only on mobile), md = default, lg = full-width */
  size?: 'sm' | 'md' | 'lg';
  /** Called after a successful toggle so parents can update their own state */
  onToggled?: (isNowFollowing: boolean, followerCount: number) => void;
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  initialIsFollowing,
  size = 'md',
  onToggled,
  className = '',
}) => {
  const { toggleFollow } = useFollow();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent navigating if inside a clickable card
    if (isLoading) return;

    // Optimistic update
    const next = !isFollowing;
    setIsFollowing(next);
    setIsLoading(true);

    try {
      const res = await toggleFollow(targetUserId);
      // Reconcile with server response
      setIsFollowing(res.isFollowing);
      onToggled?.(res.isFollowing, res.followerCount);
    } catch {
      // Roll back on error
      setIsFollowing(!next);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm:  'h-8 px-3 text-xs gap-1',
    md:  'h-9 px-4 text-sm gap-1.5',
    lg:  'h-10 w-full px-4 text-sm gap-2',
  };

  const baseClass =
    'inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-cyan-400 disabled:cursor-not-allowed';

  const variantClass = isFollowing
    ? 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] border border-[#D1D5DB]'
    : 'bg-[#0096c7] text-white hover:bg-[#0e7490]';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseClass} ${sizeClasses[size]} ${variantClass} ${className}`}
      aria-label={isFollowing ? 'Unfollow' : 'Follow'}
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isFollowing ? (
        <UserCheck size={14} />
      ) : (
        <UserPlus size={14} />
      )}
      <span>{isFollowing ? 'Following' : 'Follow'}</span>
    </button>
  );
};

export default FollowButton;
