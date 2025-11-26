"use client";

import { TrendingUp, Users, UserPlus, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useConnections } from '@/hooks/useConnections'; // Import the new hook
import { useAuth } from '@/context/AuthContext';
import { SuggestedUserDto } from '@/lib/types/connections'; // Import the new DTO
import DashboardCards from '@/app/circle/components/DashboardCards';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { AlertModal } from '@/components/AlertModal';

// --- INTERFACES & CHILD COMPONENTS --- (DashboardCard, NetworkCard remain the same)
// Assuming DashboardCardProps and NetworkCardProps are defined elsewhere
// and NetworkCard will now handle connect/message logic

// This is the new NetworkCard with dynamic logic
interface NetworkCardProps {
  user: SuggestedUserDto;
  onConnectClick: (receiverId: string) => Promise<void>;
  isConnected?: boolean;
}

// const NetworkCard: React.FC<NetworkCardProps> = ({ user, onConnectClick, isConnected }) => (
//   <div className="bg-white rounded-xl shadow-sm h-[260px]">
//     <div className="p-4 h-full flex flex-col">
//       <div className="flex flex-col items-center">
//         <div className="w-16 h-16 mb-2 bg-[#F3F4F6] rounded-full flex items-center justify-center">
//           <User size={32} className="text-[#6B7280]" />
//         </div>
//         <h3 className="text-[#1F2937] text-base font-medium text-center">{user.firstName}</h3>
//         {/* {user.lastName || user.username} */}
//         <div className="mt-1 text-center">
//           <p className="text-[#6B7280] text-sm">{user.headline}</p>
//         </div>
//         <div className="mt-3">
//           <span className="bg-[#F3F4F6] text-[#374151] text-xs px-3 py-1.5 rounded-full">
//             {user.mutualConnections} mutual connections
//           </span>
//         </div>
//       </div>
//       <button
//         onClick={() => onConnectClick(user.id)}
//         className={`mt-auto w-full h-10 rounded flex items-center justify-center gap-2 ${
//           isConnected ? 'bg-[#F3F4F6] text-[#374151]' : 'bg-[#2563EB] text-white'
//           }`}
//       >
//         <Users size={16} />
//         {isConnected ? 'Message' : 'Connect'}
//       </button>
//     </div>
//   </div>
// );

const NetworkCard: React.FC<NetworkCardProps> = ({ user, onConnectClick, isConnected }) => (
  // REMOVED fixed height h-[260px]
  <div className="bg-white rounded-xl shadow-sm"> 
    {/* Reduced padding p-4 to p-3 on small screens, keeping it responsive */}
    <div className="p-3 sm:p-4 h-full flex flex-col">
      
      <div className="flex flex-col items-center">
        {/* Profile picture size remains w-16 h-16, which is acceptable */}
        <div className="w-16 h-16 mb-2 bg-[#F3F4F6] rounded-full flex items-center justify-center">
          <User size={32} className="text-[#6B7280]" />
        </div>
        
        {/* Name: Text size remains base, which is fine */}
        <h3 className="text-[#1F2937] text-base font-medium text-center">{user.firstName}</h3>
        
        {/* Headline: Reduced margin mt-1 to mt-0.5 for compactness */}
        <div className="mt-0.5 text-center">
          <p className="text-[#6B7280] text-sm leading-snug line-clamp-1">{user.headline}</p>
        </div>
        
        {/* Mutual Connections: Reduced margin mt-3 to mt-2 for compactness */}
        <div className="mt-2">
          <span className="bg-[#F3F4F6] text-[#374151] text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
            {user.mutualConnections} mutual connections
          </span>
        </div>
      </div>
      
      {/* Button: Kept mt-auto to push it to the bottom, ensuring consistent button placement */}
      <button
        onClick={() => onConnectClick(user.id)}
        className={`mt-4 w-full h-10 rounded flex items-center justify-center gap-2 ${
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
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
    // Use the new useConnections hook to get data
  const { suggestedConnections, networkMetrics, popularConnections, isLoading, error, sendRequest, clearError } = useConnections();
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
  }, [handleScroll, error]);

  console.log('Error: ', error);

  console.log('Suggested Connections:', suggestedConnections);

  const dashboardCards = [
    { title: 'Total Connections', value: `${networkMetrics?.totalConnections}`, trend: `${networkMetrics?.totalConnectionsTrend}% this month`, icon: <Users size={16} />, iconColor: 'text-[#EF4444]', trendIcon: <TrendingUp size={12} />, trendColor: 'text-[#16A34A]', refLink: "" },
    { title: 'Joined Groups', value: `${networkMetrics?.joinedGroups}`, trend: `${networkMetrics?.joinedGroupsTrend} new this month`, icon: <Users size={16} />, iconColor: 'text-[#3B82F6]', trendIcon: <TrendingUp size={12} />, trendColor: 'text-[#16A34A]', refLink: "" },
    { title: 'Pending Requests', value: `${networkMetrics?.pendingRequests}`, trend: `${networkMetrics?.pendingRequestsTrend} new this week`, icon: <UserPlus size={16} />, iconColor: 'text-[#22C55E]', trendIcon: <Clock size={12} />, trendColor: 'text-[#F59E0B]', refLink: "" },
    { title: 'Network Growth', value: `${networkMetrics?.networkGrowth}`, trend: `${networkMetrics?.networkGrowthPercentage}% this month`, icon: <TrendingUp size={16} />, iconColor: 'text-[#A855F7]', trendIcon: <TrendingUp size={12} />, trendColor: 'text-[#16A34A]', refLink: "" }
  ];

  return (
    <div className="flex-1">
      {/* {
        error && <AlertModal key={Date.now()} duration={4000} message={error} type="error" />
      } */}
      {
        error && <AlertModal duration={4000} message={error} type="error" onClose={clearError} />
      }
      <div className="flex justify-center w-full">
        <div className="w-full max-w-[640px] mt-6">

          {/* CORRECTED: This is now a responsive grid */}
          <div className="grid grid-cols-4 md:grid-cols-4 gap-4 mb-8">
            {dashboardCards.map((card, index) => (
              <DashboardCards key={index} {...card} />
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
                  ) : (
                    popularConnections.map((user, index) => (
                      <div key={user.id || index} className="w-[50%] sm:w-[50%] lg:w-[32%] shrink-0 snap-start sm:snap-center">
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
              ) : ( suggestedConnections['People With Similar Headline'] && suggestedConnections["People With Similar Headline"].length > 0 ?
                suggestedConnections["People With Similar Headline"].map((user, index) => (
                  <div key={user.id || index} className="w-[50%] sm:w-[46%] lg:w-[32%] shrink-0 snap-start sm:snap-center">
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
              ) : (suggestedConnections["People With Similar Title"] && suggestedConnections["People With Similar Title"].length > 0 ?
                suggestedConnections["People With Similar Title"].map((user, index) => (
                  <div key={user.id || index} className="w-[50%] sm:w-[46%] lg:w-[32%] shrink-0 snap-start sm:snap-center">
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
              ) :
              (suggestedConnections["People With Similar Education"] && suggestedConnections["People With Similar Education"].length > 0 ?
                suggestedConnections["People With Similar Education"].map((user, index) => (
                  <div key={user.id || index} className="w-[50%] sm:w-[46%] lg:w-[32%] shrink-0 snap-start sm:snap-center">
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