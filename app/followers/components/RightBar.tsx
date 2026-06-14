"use client";

import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFollow } from '@/hooks/useFollow';
import { useFollowSuggestions } from '@/hooks/useFollowSuggestions';
import FollowButton from '@/components/FollowButton';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { Users, TrendingUp, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';

const RightBar = ({ scrollSourceRef }: { scrollSourceRef: React.RefObject<HTMLElement> }) => {
  const { user } = useAuth();
  const router = useRouter();
  const { getFollowStatus, isLoading } = useFollow();
  const [stats, setStats] = useState<{ followerCount: number, followingCount: number } | null>(null);
  const { suggestions, isLoading: suggestionsLoading, removeSuggestion } = useFollowSuggestions(5, !!user?.id);

  const sidebarRef = useRef<HTMLDivElement | null>(null) as React.MutableRefObject<HTMLDivElement | null>;
  const syncing = useRef(false);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.id) {
        const s = await getFollowStatus(user.id);
        if (s) setStats(s);
      }
    };
    fetchStats();
  }, [user?.id, getFollowStatus]);

  useLayoutEffect(() => {
    const mainEl = scrollSourceRef.current;
    const sideEl = sidebarRef.current;
    if (!mainEl || !sideEl) return;

    const onMainScroll = () => {
      if (syncing.current) return;
      syncing.current = true;
      const delta = mainEl.scrollTop - lastScrollTop.current;
      lastScrollTop.current = mainEl.scrollTop;
      const maxSideScroll = sideEl.scrollHeight - sideEl.clientHeight;
      sideEl.scrollTop = Math.max(0, Math.min(sideEl.scrollTop + delta, maxSideScroll));
      requestAnimationFrame(() => { syncing.current = false; });
    };

    mainEl.addEventListener("scroll", onMainScroll);
    return () => mainEl.removeEventListener("scroll", onMainScroll);
  }, [sidebarRef.current]);

  const setSidebarRef = (node: HTMLDivElement | null) => {
    if (!node) return;
    sidebarRef.current = node;
  };

  return (
    <aside className="block pb-20 laptop:pb-0 xl:w-[260px] laptop:w-[100%] mr-6 ml-6 laptop:ml-0 shrink-0">
      <div
        ref={setSidebarRef}
        className="sticky top-[80px] max-h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide"
      >
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
          <h2 className="text-[#1F2937] font-medium mb-4 text-lg">Follower Stats</h2>

          {isLoading && !stats ? (
            <div className="p-6 text-center"><LoadingSpinner /></div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#F9FAFB] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Followers</p>
                    <p className="text-lg font-bold text-gray-900">{stats?.followerCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F9FAFB] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Following</p>
                    <p className="text-lg font-bold text-gray-900">{stats?.followingCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-[#1F2937] font-medium mb-4">Discover More</h2>
            <p className="text-sm text-gray-500 mb-4">Find more interesting people and content in your circle.</p>
            <button
              onClick={() => router.push('/circle')}
              className="w-full text-[#2563EB] font-medium py-2 bg-[#F3F4F6] hover:bg-gray-200 rounded transition-colors"
            >
              Go to My Circle
            </button>
          </div>
        </div>

        {/* Follow Suggestions */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-5 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus size={18} className="text-[#2563EB]" />
            <h2 className="text-[#1F2937] font-semibold text-sm">People You May Want to Follow</h2>
          </div>

          {suggestionsLoading ? (
            <div className="flex justify-center py-4"><LoadingSpinner /></div>
          ) : suggestions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">No suggestions right now</p>
          ) : (
            <div className="space-y-3">
              {suggestions.map((s) => (
                <div key={s.userId} className="flex items-center gap-3">
                  <img
                    src={getProfileImageUrl(s.profilePictureMediaId || s.profilePictureUrl)}
                    alt={s.firstName}
                    className="w-9 h-9 rounded-full object-cover shrink-0 cursor-pointer"
                    onClick={() => router.push(`/profile/${s.userId}`)}
                  />
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/profile/${s.userId}`)}>
                    <p className="text-sm font-medium text-gray-900 truncate">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{s.headline || 'Buronet member'}</p>
                  </div>
                  <FollowButton
                    targetUserId={s.userId}
                    initialIsFollowing={false}
                    size="sm"
                    onToggled={(isNowFollowing) => {
                      if (isNowFollowing) removeSuggestion(s.userId);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-[#E5E7EB] text-sm">
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            <a href="#" className="text-[#6B728B] hover:underline">About</a>
            <a href="#" className="text-[#6B728B] hover:underline">Help Center</a>
            <a href="#" className="text-[#6B728B] hover:underline">Privacy &amp; Terms</a>
            <a href="#" className="text-[#6B728B] hover:underline">Advertising</a>
            <a href="#" className="text-[#6B728B] hover:underline">Get the App</a>
          </div>
          <p className="text-[#6B728B]">&copy; 2025 Buronet</p>
        </div>
      </div>
    </aside>
  );
};

export default RightBar;
