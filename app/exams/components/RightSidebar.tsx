"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';

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
          text: 'text-[#1D4ED8]'
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

const RightSidebar = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
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
    <div className="w-[287px] mr-6 mt-6 mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
        <h2 className="text-[#1F2937] font-semibold text-lg mb-4">Recent Exam Updates</h2>
        
        <div className="relative">
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
        </div>

        <div className="mt-6 space-y-4">
          {updates.map((update, index) => (
            <UpdateCard key={index} {...update} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6 mt-6">
        <h3 className="text-[#1F2937] font-medium mb-4">Important Links</h3>
        
        <div className="space-y-4">
          <a href="https://upsc.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#374151] hover:text-[#2563eb]">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5156 12.8766H1.48438C0.664062 12.8766 0 12.2125 0 11.3922V2.60781C0 1.7875 0.664062 1.12344 1.48438 1.12344H16.5156C17.3359 1.12344 18 1.7875 18 2.60781V11.3922C18 12.2125 17.3359 12.8766 16.5156 12.8766ZM1.48438 2.60781V11.3922H16.5156V2.60781H1.48438Z" fill="#9CA3AF"/>
              <path d="M9 8.87656C8.1 8.87656 7.2 8.47656 6.6 7.87656L1.2 2.47656L2.4 1.27656L9 7.87656L15.6 1.27656L16.8 2.47656L11.4 7.87656C10.8 8.47656 9.9 8.87656 9 8.87656Z" fill="#9CA3AF"/>
            </svg>
            <span>UPSC Official Website</span>
          </a>

          <a href="https://ssc.nic.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#374151] hover:text-[#2563eb]">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5156 12.8766H1.48438C0.664062 12.8766 0 12.2125 0 11.3922V2.60781C0 1.7875 0.664062 1.12344 1.48438 1.12344H16.5156C17.3359 1.12344 18 1.7875 18 2.60781V11.3922C18 12.2125 17.3359 12.8766 16.5156 12.8766ZM1.48438 2.60781V11.3922H16.5156V2.60781H1.48438Z" fill="#9CA3AF"/>
              <path d="M9 8.87656C8.1 8.87656 7.2 8.47656 6.6 7.87656L1.2 2.47656L2.4 1.27656L9 7.87656L15.6 1.27656L16.8 2.47656L11.4 7.87656C10.8 8.47656 9.9 8.87656 9 8.87656Z" fill="#9CA3AF"/>
            </svg>
            <span>SSC Portal</span>
          </a>

          <a href="https://rrb.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#374151] hover:text-[#2563eb]">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5156 12.8766H1.48438C0.664062 12.8766 0 12.2125 0 11.3922V2.60781C0 1.7875 0.664062 1.12344 1.48438 1.12344H16.5156C17.3359 1.12344 18 1.7875 18 2.60781V11.3922C18 12.2125 17.3359 12.8766 16.5156 12.8766ZM1.48438 2.60781V11.3922H16.5156V2.60781H1.48438Z" fill="#9CA3AF"/>
              <path d="M9 8.87656C8.1 8.87656 7.2 8.47656 6.6 7.87656L1.2 2.47656L2.4 1.27656L9 7.87656L15.6 1.27656L16.8 2.47656L11.4 7.87656C10.8 8.47656 9.9 8.87656 9 8.87656Z" fill="#9CA3AF"/>
            </svg>
            <span>Railway Recruitment Board</span>
          </a>

          <a href="https://ibps.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#374151] hover:text-[#2563eb]">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5156 12.8766H1.48438C0.664062 12.8766 0 12.2125 0 11.3922V2.60781C0 1.7875 0.664062 1.12344 1.48438 1.12344H16.5156C17.3359 1.12344 18 1.7875 18 2.60781V11.3922C18 12.2125 17.3359 12.8766 16.5156 12.8766ZM1.48438 2.60781V11.3922H16.5156V2.60781H1.48438Z" fill="#9CA3AF"/>
              <path d="M9 8.87656C8.1 8.87656 7.2 8.47656 6.6 7.87656L1.2 2.47656L2.4 1.27656L9 7.87656L15.6 1.27656L16.8 2.47656L11.4 7.87656C10.8 8.47656 9.9 8.87656 9 8.87656Z" fill="#9CA3AF"/>
            </svg>
            <span>IBPS Official Website</span>
          </a>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6 mt-6">
        <h3 className="text-[#1F2937] font-medium mb-4">Preparation Resources</h3>
        
        <div className="bg-gradient-to-b from-[#EFF6FF] to-[#EEF2FF] rounded-xl p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-[#DBEAFE] p-2 rounded-lg">
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 16.3438V0H14V16.3438H0ZM1.4 14.9438H12.6V1.4H1.4V14.9438Z" fill="#2563EB"/>
                <path d="M2.8 3.8H11.2V5.2H2.8V3.8ZM2.8 6.6H11.2V8H2.8V6.6ZM2.8 9.4H11.2V10.8H2.8V9.4ZM2.8 12.2H8.4V13.6H2.8V12.2Z" fill="#2563EB"/>
              </svg>
            </div>
            <div>
              <h4 className="text-[#1F2937] font-medium">Free Study Material</h4>
              <p className="text-[#6B7280] text-sm">For all competitive exams</p>
            </div>
          </div>
          <button className="w-full bg-white text-[#2563EB] py-2 rounded hover:bg-[#F3F4F6] transition-colors">
            Access Now
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
  );
};

export default RightSidebar; 