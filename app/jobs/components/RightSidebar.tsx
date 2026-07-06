"use client";

import { useUpdates } from '@/hooks/useUpdates';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import UpdatesList from '@/components/UpdatesList';

interface UpdateCardProps {
  type: 'Results' | 'Exam Schedule' | 'Application' | 'Admit Card';
  timeAgo: string;
  title: string;
}

const UpdateCard = ({ type, timeAgo, title }: UpdateCardProps) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'Results':
        return {
          bg: 'bg-[#DCFCE7]',
          text: 'text-[#15803D]'
        };
      case 'Exam Schedule':
        return {
          bg: 'bg-[#DBEAFE]',
          text: 'text-[#0e7490]'
        };
      case 'Application':
        return {
          bg: 'bg-[#FEF3C7]',
          text: 'text-[#C2410C]'
        };
      case 'Admit Card':
        return {
          bg: 'bg-[#F3E8FF]',
          text: 'text-[#7E22CE]'
        };
      default:
        return {
          bg: 'bg-[#F3F4F6]',
          text: 'text-[#374151]'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="bg-[#F9FAFB] rounded-xl p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`${styles.bg} ${styles.text} px-2 py-0.5 rounded-full text-[11px]`}>
              {type}
            </span>
            <span className="text-[#6B7280] text-[11px]">{timeAgo}</span>
          </div>
          <h3 className="text-[#1F2937] font-medium text-[13px]">{title}</h3>
        </div>
        <button className="w-4 h-4 text-[#9CA3AF] hover:text-[#6B7280]">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
};

const RightSidebar = ({ scrollSourceRef }: { scrollSourceRef: React.RefObject<HTMLElement> }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null) as React.MutableRefObject<HTMLDivElement | null>;
  const syncing = useRef(false);
  const lastScrollTop = useRef(0);

  const jobs = useUpdates("JOB", 5);

  useLayoutEffect(() => {
    const mainEl = scrollSourceRef.current;
    const sideEl = sidebarRef.current;
    if (!mainEl || !sideEl) return;

    const onMainScroll = () => {
      // NEW: If we are on mobile, don't sync scrolls. 
      // Let the browser handle natural page scrolling.
      if (window.innerWidth < 1024) return; 

      if (syncing.current) return;
      syncing.current = true;

      const delta = mainEl.scrollTop - lastScrollTop.current;
      lastScrollTop.current = mainEl.scrollTop;

      const maxSideScroll = sideEl.scrollHeight - sideEl.clientHeight;

      sideEl.scrollTop = Math.max(
        0,
        Math.min(sideEl.scrollTop + delta, maxSideScroll)
      );

      requestAnimationFrame(() => {
        syncing.current = false;
      });
    };

    mainEl.addEventListener("scroll", onMainScroll);
    return () => mainEl.removeEventListener("scroll", onMainScroll);
  }, [scrollSourceRef]); // Added dependency for safety

const setSidebarRef = (node: HTMLDivElement | null) => {
  if (!node) return;
  sidebarRef.current = node;
  console.log("sidebar ref populated", node);
};

  const updates = [
    {
      type: 'Results' as const,
      timeAgo: '2 hours ago',
      title: 'UPSC Civil Services Prelims Results Announced'
    },
    {
      type: 'Exam Schedule' as const,
      timeAgo: 'Yesterday',
      title: 'SSC CGL Tier 1 Exam Dates Released'
    },
    {
      type: 'Results' as const,
      timeAgo: '2 days ago',
      title: 'RRB NTPC Final Result Published'
    },
    {
      type: 'Application' as const,
      timeAgo: '3 days ago',
      title: 'IBPS PO Application Window Opens'
    },
    {
      type: 'Admit Card' as const,
      timeAgo: '4 days ago',
      title: 'NTA JEE Main Session 2 Admit Card Released'
    }
  ];

  return (
    <div className="block w-full max-w-[640px] mx-auto px-4 md:px-0 laptop:w-full laptop:max-w-none laptop:px-0 laptop:ml-0 laptop:mr-6 xl:w-[260px] shrink-0">
      <div
        ref={setSidebarRef}
        className="
          lg:sticky 
          lg:top-[80px] 
          lg:max-h-[calc(100vh-100px)] 
          lg:overflow-y-auto 
          scrollbar-hide
        "
      >
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <h2 className="text-base sm:text-[18px] font-bold text-gray-900 mb-5">Recent Job Updates</h2>
        
        {/* <div className="relative">
          {showLeftButton && (
            <button 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 flex items-center justify-center z-10"
            >
              <ChevronLeft size={20} className="text-[#6B7280]" />
            </button>
          )}
          <div className="relative">
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <button className="bg-[#2563eb] text-white px-3 py-1 rounded text-xs whitespace-nowrap">
                All Updates
              </button>
              <button className="bg-[#f3f4f6] text-[#374151] px-3 py-1 rounded text-xs whitespace-nowrap">
                Results
              </button>
              <button className="bg-[#f3f4f6] text-[#374151] px-3 py-1 rounded text-xs whitespace-nowrap">
                Admit Cards
              </button>
              <button className="bg-[#f3f4f6] text-[#374151] px-3 py-1 rounded text-xs whitespace-nowrap">
                Applications
              </button>
            </div>
            <div className={`absolute left-0 top-0 bottom-0 w-12 pointer-events-none ${
              showLeftButton ? 'bg-gradient-to-r from-white via-white/80 to-transparent' : ''
            }`} />
            <div className={`absolute right-0 top-0 bottom-0 w-12 pointer-events-none ${
              showRightButton ? 'bg-gradient-to-l from-white via-white/80 to-transparent' : ''
            }`} />
          </div>
          {showRightButton && (
            <button 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 flex items-center justify-center z-10"
            >
              <ChevronRight size={20} className="text-[#6B7280]" />
            </button>
          )}
        </div> */}

        <div className="mt-6 space-y-4">
          {/* {updates.map((update, index) => (
            <UpdateCard key={index} {...update} />
          ))} */}
          <UpdatesList title="Job Updates" updates={jobs.data} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <h3 className="text-base sm:text-[18px] font-bold text-gray-900 mb-5">Important Links</h3>
        
        <div className="space-y-4">
          <a href="https://upsc.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#505965] hover:text-[#0096c7] transition-colors group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-[#0096c7] transition-colors">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span className="text-sm sm:text-[15px] font-medium">UPSC Official Website</span>
          </a>

          <a href="https://ssc.nic.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#505965] hover:text-[#0096c7] transition-colors group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-[#0096c7] transition-colors">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span className="text-sm sm:text-[15px] font-medium">SSC Portal</span>
          </a>

          <a href="https://rrb.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#505965] hover:text-[#0096c7] transition-colors group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-[#0096c7] transition-colors">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span className="text-sm sm:text-[15px] font-medium">Railway Recruitment Board</span>
          </a>

          <a href="https://ibps.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#505965] hover:text-[#0096c7] transition-colors group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-[#0096c7] transition-colors">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span className="text-sm sm:text-[15px] font-medium">IBPS Official Website</span>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <h3 className="text-base sm:text-[18px] font-bold text-gray-900 mb-5">Preparation Resources</h3>
        
        <div className="bg-gradient-to-b from-[#ecfeff] to-[#EEF2FF] rounded-xl p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-[#DBEAFE] p-2 rounded-lg">
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 16.3438V0H14V16.3438H0ZM1.4 14.9438H12.6V1.4H1.4V14.9438Z" fill="#0096c7"/>
                <path d="M2.8 3.8H11.2V5.2H2.8V3.8ZM2.8 6.6H11.2V8H2.8V6.6ZM2.8 9.4H11.2V10.8H2.8V9.4ZM2.8 12.2H8.4V13.6H2.8V12.2Z" fill="#0096c7"/>
              </svg>
            </div>
            <div>
              <h4 className="text-[#1F2937] font-medium">Free Study Material</h4>
              <p className="text-[#6B7280] text-sm">For all competitive exams</p>
            </div>
          </div>
          <button className="w-full bg-white text-[#0096c7] py-2 rounded hover:bg-[#F3F4F6] transition-colors">
            Coming Soon
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <a href="/about" className="text-[#6B7280] hover:text-[#374151] text-sm">About</a>
          <a href="/help" className="text-[#6B7280] hover:text-[#374151] text-sm">Help Center</a>
          <a href="/privacy" className="text-[#6B7280] hover:text-[#374151] text-sm">Privacy & Terms</a>
          <a href="/advertising" className="text-[#6B7280] hover:text-[#374151] text-sm">Advertising</a>
          <a href="/business" className="text-[#6B7280] hover:text-[#374151] text-sm">Business Services</a>
          <a href="/app" className="text-[#6B7280] hover:text-[#374151] text-sm">Get the App</a>
        </div>
        <p className="text-[#6B7280] text-sm">© 2025 Buronet Corporation</p>
      </div>
      </div>
    </div>
  );
};

export default RightSidebar; 