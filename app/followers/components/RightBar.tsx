"use client";

import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFollow } from '@/hooks/useFollow';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { Users, TrendingUp } from 'lucide-react';

const RightBar = ({ scrollSourceRef }: { scrollSourceRef: React.RefObject<HTMLElement> }) => {
  const { user } = useAuth();
  const { getFollowStatus, isLoading } = useFollow();
  const [stats, setStats] = useState<{ followerCount: number, followingCount: number } | null>(null);

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
      <div ref={setSidebarRef} className="sticky top-[80px] max-h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide">
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
          <h2 className="text-[#1F2937] font-bold mb-5 text-2xl">Follower Stats</h2>
          {isLoading && !stats ? (
            <div className="p-6 text-center"><LoadingSpinner /></div>
          ) : (
            <div className="space-y-3">
              <div className="bg-[#F9FAFB] rounded-xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-cyan-100 text-[#0096c7] rounded-xl flex items-center justify-center shrink-0">
                  <Users size={26} />
                </div>
                <div>
                  <p className="text-base text-gray-500 font-semibold">Followers</p>
                  <p className="text-3xl font-bold text-gray-900 leading-tight">{stats?.followerCount ?? 0}</p>
                </div>
              </div>
              <div className="bg-[#F9FAFB] rounded-xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp size={26} />
                </div>
                <div>
                  <p className="text-base text-gray-500 font-semibold">Following</p>
                  <p className="text-3xl font-bold text-gray-900 leading-tight">{stats?.followingCount ?? 0}</p>
                </div>
              </div>
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