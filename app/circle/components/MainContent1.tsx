"use client";

import { TrendingUp, Users, UserPlus, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useConnections } from '@/hooks/useConnections'; // Import the new hook
import { useAuth } from '@/context/AuthContext';
import { SuggestedUserDto } from '@/lib/types/connections'; // Import the new DTO
import DashboardCards from '@/app/circle/components/DashboardCards';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

// --- INTERFACES & CHILD COMPONENTS --- (DashboardCard, NetworkCard remain the same)
// Assuming DashboardCardProps and NetworkCardProps are defined elsewhere
// and NetworkCard will now handle connect/message logic

// This is the new NetworkCard with dynamic logic
interface NetworkCardProps {
  user: SuggestedUserDto;
  onConnectClick: (receiverId: string) => Promise<void>;
  isConnected?: boolean;
}

const NetworkCard: React.FC<NetworkCardProps> = ({ user, onConnectClick, isConnected }) => (
  <div className="bg-white rounded-xl shadow-sm h-[260px]">
    <div className="p-4 h-full flex flex-col">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 mb-2 bg-[#F3F4F6] rounded-full flex items-center justify-center">
          <User size={32} className="text-[#6B7280]" />
        </div>
        <h3 className="text-[#1F2937] text-base font-medium text-center">{user.firstName}</h3>
        {/* {user.lastName || user.username} */}
        <div className="mt-1 text-center">
          <p className="text-[#6B7280] text-sm">{user.headline}</p>
        </div>
        <div className="mt-3">
          <span className="bg-[#F3F4F6] text-[#374151] text-xs px-3 py-1.5 rounded-full">
            {user.mutualConnections} mutual connections
          </span>
        </div>
      </div>
      <button
        onClick={() => onConnectClick(user.id)}
        className={`mt-auto w-full h-10 rounded flex items-center justify-center gap-2 ${
          isConnected ? 'bg-[#F3F4F6] text-[#374151]' : 'bg-[#2563EB] text-white'
          }`}
      >
        <Users size={16} />
        {isConnected ? 'Message' : 'Connect'}
      </button>
    </div>
  </div>
);


const MainContent = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dashboardScrollRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const isAtStart = container.scrollLeft < 1;
      const isAtEnd = Math.abs(container.scrollWidth - container.clientWidth - container.scrollLeft) < 1;

      setShowLeftButton(!isAtStart);
      setShowRightButton(!isAtEnd);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container && container.children.length > 0) {
      const firstItem = container.children[0] as HTMLElement;
      const itemWidth = firstItem.offsetWidth;
      const gap = parseInt(window.getComputedStyle(container).gap);
      const scrollAmount = itemWidth + gap;

      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    handleScroll();
    container.addEventListener('scroll', handleScroll);

    const resizeObserver = new ResizeObserver(() => handleScroll());
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.unobserve(container);
    };
  }, [handleScroll]);

  // Use the new useConnections hook to get data
  const { suggestedConnections, networkMetrics, popularConnections, isLoading, error, sendRequest } = useConnections();

  console.log('Suggested Connections:', suggestedConnections);

  const dashboardCards = [
    { title: 'Total Connections', value: `${networkMetrics?.totalConnections}`, trend: `${networkMetrics?.totalConnectionsTrend}% this month`, icon: <Users size={16} />, iconColor: 'text-[#EF4444]', trendIcon: <TrendingUp size={12} />, trendColor: 'text-[#16A34A]', refLink: "" },
    { title: 'Joined Groups', value: `${networkMetrics?.joinedGroups}`, trend: `${networkMetrics?.joinedGroupsTrend} new this month`, icon: <Users size={16} />, iconColor: 'text-[#3B82F6]', trendIcon: <TrendingUp size={12} />, trendColor: 'text-[#16A34A]', refLink: "" },
    { title: 'Pending Requests', value: `${networkMetrics?.pendingRequests}`, trend: `${networkMetrics?.pendingRequestsTrend} new this week`, icon: <UserPlus size={16} />, iconColor: 'text-[#22C55E]', trendIcon: <Clock size={12} />, trendColor: 'text-[#F59E0B]', refLink: "" },
    { title: 'Network Growth', value: `${networkMetrics?.networkGrowth}`, trend: `${networkMetrics?.networkGrowthPercentage}% this month`, icon: <TrendingUp size={16} />, iconColor: 'text-[#A855F7]', trendIcon: <TrendingUp size={12} />, trendColor: 'text-[#16A34A]', refLink: "" }
  ];

  return (
    <div className="flex-1">
      <div className="flex justify-center w-full">
        <div className="w-full max-w-[640px] mt-6">

          <div 
            ref={dashboardScrollRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 
              sm:flex sm:overflow-x-auto sm:snap-x sm:snap-proximity sm:scrollbar-hide 
              sm:pb-2 sm:-mt-2 sm:-mx-4 sm:px-4 md:grid md:grid-cols-4 md:flex-wrap md:overflow-x-visible md:snap-none"
          >
            {dashboardCards.map((card, index) => (
              <div 
                key={index} 
                className="w-full sm:w-[calc(50%-8px)] sm:shrink-0 sm:snap-start md:w-auto" // Control card width on mobile to show two cards at a time
              >
                {/* DashboardCards is assumed to be the card component. 
                  We wrap it in a div to control its width and make it horizontally scrollable. 
                  The existing `grid-cols-2` is kept but overridden by `sm:flex` and `sm:w-[calc(50%-8px)]` */}
                <DashboardCards {...card} />
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4 px-4 sm:px-0">
              <h2 className="text-[#1F2937] text-lg font-medium">Popular in Your Network</h2>
              <button className="text-[#2563EB] text-sm font-medium">View All</button>
            </div>
            <div className="relative">
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#EEF0F4] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showLeftButton ? 'opacity-100' : 'opacity-0'}`} />

                <div
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-auto snap-x snap-proximity scrollbar-hide sm:scroll-p-4 sm:px-4 sm:-mx-4"
                >
                  {/* Use dynamic suggestedConnections from the hook */}
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : (
                    popularConnections.map((user, index) => (
                      <div key={user.id || index} className="w-full sm:w-[46%] lg:w-[32%] shrink-0 snap-start sm:snap-center">
                        <NetworkCard user={user} onConnectClick={sendRequest} isConnected={false} />
                      </div>
                    ))
                  )}
                </div>

                <div className={`absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#EEF0F4] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showRightButton ? 'opacity-100' : 'opacity-0'}`} />
              </div>

              <button
                onClick={() => scroll('left')}
                className={`hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white rounded-full shadow-md items-center justify-center z-20 transition-opacity duration-300 ${showLeftButton ? 'opacity-100' : 'opacity-0'}`}
              >
                <ChevronLeft size={20} className="text-[#6B7280]" />
              </button>
              <button
                onClick={() => scroll('right')}
                className={`hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white rounded-full shadow-md items-center justify-center z-20 transition-opacity duration-300 ${showRightButton ? 'opacity-100' : 'opacity-0'}`}
              >
                <ChevronRight size={20} className="text-[#6B7280]" />
              </button>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[#1F2937] text-lg font-medium">People With Similar Profile</h2>
              <button className="text-[#2563EB] text-sm font-medium">See More</button>
            </div>
            {/* The People You May Know section can also be made dynamic with a different hook/data set */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto snap-x snap-proximity scrollbar-hide sm:scroll-p-4 sm:px-4 sm:-mx-4"
            >
              {/* Use dynamic suggestedConnections from the hook */}
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : ( suggestedConnections['People With Similar Headline'] && suggestedConnections["People With Similar Headline"].length > 0 ?
                suggestedConnections["People With Similar Headline"].map((user, index) => (
                  <div key={user.id || index} className="w-full sm:w-[46%] lg:w-[32%] shrink-0 snap-start sm:snap-center">
                    <NetworkCard user={user} onConnectClick={sendRequest} isConnected={false} />
                  </div>
                )) : "No profiles found"
              )}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[#1F2937] text-lg font-medium">People With Similar Title</h2>
              <button className="text-[#2563EB] text-sm font-medium">See More</button>
            </div>
            {/* The People You May Know section can also be made dynamic with a different hook/data set */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto snap-x snap-proximity scrollbar-hide sm:scroll-p-4 sm:px-4 sm:-mx-4"
            >
              {/* Use dynamic suggestedConnections from the hook */}
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (suggestedConnections["People With Similar Title"] && suggestedConnections["People With Similar Title"].length > 0 ?
                suggestedConnections["People With Similar Title"].map((user, index) => (
                  <div key={user.id || index} className="w-full sm:w-[46%] lg:w-[32%] shrink-0 snap-start sm:snap-center">
                    <NetworkCard user={user} onConnectClick={sendRequest} isConnected={false} />
                  </div>
                )) : "No profiles found"
              )}
            </div>
          </div>
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[#1F2937] text-lg font-medium">People With Similar Education</h2>
              <button className="text-[#2563EB] text-sm font-medium">See More</button>
            </div>
            {/* The People You May Know section can also be made dynamic with a different hook/data set */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto snap-x snap-proximity scrollbar-hide sm:scroll-p-4 sm:px-4 sm:-mx-4"
            >
              {/* Use dynamic suggestedConnections from the hook */}
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (suggestedConnections["People With Similar Education"] && suggestedConnections["People With Similar Education"].length > 0 ?
                suggestedConnections["People With Similar Education"].map((user, index) => (
                  <div key={user.id || index} className="w-full sm:w-[46%] lg:w-[32%] shrink-0 snap-start sm:snap-center">
                    <NetworkCard user={user} onConnectClick={sendRequest} isConnected={false} />
                  </div>
                )) : "No profiles found"
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MainContent;