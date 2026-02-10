"use client";

import { TrendingUp, Users, UserPlus, Clock, User } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useConnections } from '@/hooks/useConnections'; // Import the new hook
import { useAuth } from '@/context/AuthContext';
import { SuggestedUserDto } from '@/lib/types/connections'; // Import the new DTO
import DashboardCards from '@/app/circle/components/DashboardCards';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { AlertModal } from '@/components/AlertModal';
import SeeMoreModal from './SeeMoreModal';
import { useRouter } from 'next/navigation';

// --- INTERFACES & CHILD COMPONENTS --- (DashboardCard, NetworkCard remain the same)
// Assuming DashboardCardProps and NetworkCardProps are defined elsewhere
// and NetworkCard will now handle connect/message logic

// This is the new NetworkCard with dynamic logic
interface NetworkCardProps {
  user: SuggestedUserDto;
  onConnectClick: (receiverId: string) => Promise<void>;
  isConnected?: boolean;
  isRequestSent?: boolean;
  isRequestPending?: boolean;
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

const NetworkCard: React.FC<NetworkCardProps> = ({ user, onConnectClick, isConnected, isRequestSent, isRequestPending }) => 
  {
    const router = useRouter();
      const handleOpenClick = (refLink: string | undefined) => {
    if (!refLink) return;
    
    // Remove any leading slash from the prop, then add one back
    const cleanPath = "/profile/" + (refLink.startsWith('/') ? refLink.slice(1) : refLink);
    router.push(cleanPath);
  };
   return (
  // REMOVED fixed height h-[260px]
  <div className="bg-white rounded-xl shadow-sm" onClick={() => handleOpenClick(user.id)}>
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
          {user.headline ? <p className="text-[#6B7280] text-sm leading-snug line-clamp-1">{user.headline}</p> : <p className="text-[#6B7280] text-sm italic text-center">No headline available</p>}
        </div>
        
        {/* Mutual Connections: Reduced margin mt-3 to mt-2 for compactness */}
        <div className="mt-2">
          <span className="bg-[#F3F4F6] text-[#374151] text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
            {user.mutualConnections} mutual connections
          </span>
        </div>
      </div>
      
      {/* Button: Kept mt-auto to push it to the bottom, ensuring consistent button placement */}
      {(() => {
        const pending = Boolean(isRequestSent || isRequestPending);
        const disabled = !isConnected && pending;
        const label = isConnected
          ? 'Message'
          : pending
          ? 'Request Pending'
          : 'Connect';

        return (
          <button
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              if (disabled) return;
              onConnectClick(user.id);
            }}
            className={`mt-4 w-full h-10 rounded flex items-center justify-center gap-2 ${
              disabled
                ? 'bg-[#F3F4F6] text-[#6B7280] cursor-not-allowed'
                : isConnected
                ? 'bg-[#F3F4F6] text-[#374151]'
                : 'bg-[#2563EB] text-white'
            }`}
          >
            <Users size={16} />
            {label}
          </button>
        );
      })()}
    </div>
  </div>
)};


const MainContent = () => {
    // Use the new useConnections hook to get data
  const { suggestedConnections, networkMetrics, popularConnections, isLoading, error, sendRequest, clearError, pendingIncomingRequests, pendingOutgoingRequests } = useConnections({ includeOutgoingPending: true });
  const { user: authUser } = useAuth();

  // Show a maximum number of cards per breakpoint:
  // - mobile (< md): 2
  // - medium (md .. < lg): 4
  // - desktop (lg+): 3
  const getCardVisibilityClass = (index: number) => {
    if (index < 2) return '';
    if (index === 2) return 'hidden md:block';
    if (index === 3) return 'hidden md:block lg:hidden';
    return 'hidden';
  };

  const outgoingSet = useMemo(() => {
    const set = new Set<string>();
    if (!authUser?.id) return set;
    for (const req of pendingOutgoingRequests) {
      if (req.status === 'Pending' && req.senderId === authUser.id) {
        set.add(req.receiverId);
      }
    }
    return set;
  }, [pendingOutgoingRequests, authUser?.id]);

  const incomingSet = useMemo(() => {
    const set = new Set<string>();
    if (!authUser?.id) return set;
    for (const req of pendingIncomingRequests) {
      if (req.status === 'Pending' && req.receiverId === authUser.id) {
        set.add(req.senderId);
      }
    }
    return set;
  }, [pendingIncomingRequests, authUser?.id]);

  const [modalState, setModalState] = useState<{ isOpen: boolean; title: string; users: SuggestedUserDto[] }>({
    isOpen: false,
    title: '',
    users: [],
  });

  const openModal = (title: string, users: SuggestedUserDto[]) => {
    setModalState({ isOpen: true, title, users });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, title: '', users: [] });
  };

  console.log('Error: ', error);

  console.log('Suggested Connections:', suggestedConnections);

  const dashboardCards = [
    { title: 'Total Connections', value: `${networkMetrics?.totalConnections}`, trend: `${networkMetrics?.totalConnectionsTrend}% this month`, icon: <Users size={16} />, iconColor: 'text-[#EF4444]', trendIcon: <TrendingUp size={12} />, trendColor: 'text-[#16A34A]', refLink: "network/requests?tab=connections" },
    // { title: 'Joined Groups', value: `${networkMetrics?.joinedGroups}`, trend: `${networkMetrics?.joinedGroupsTrend} new this month`, icon: <Users size={16} />, iconColor: 'text-[#3B82F6]', trendIcon: <TrendingUp size={12} />, trendColor: 'text-[#16A34A]', refLink: "" },
    { title: 'Joined Groups', value: `Coming Soon`, trend: `${networkMetrics?.joinedGroupsTrend} new this month`, icon: <Users size={16} />, iconColor: 'text-[#3B82F6]', trendIcon: <TrendingUp size={12} />, trendColor: 'text-[#16A34A]', refLink: "" },
    { title: 'Pending Requests', value: `${networkMetrics?.pendingRequests}`, trend: `${networkMetrics?.pendingRequestsTrend} new this week`, icon: <UserPlus size={16} />, iconColor: 'text-[#22C55E]', trendIcon: <Clock size={12} />, trendColor: 'text-[#F59E0B]', refLink: "/network/requests" },
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
        <div className="w-full max-w-6xl">

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {dashboardCards.map((card, index) => (
              <DashboardCards key={index} {...card} />
            ))}
          </div>

          <div className="mt-8 px-4 sm:px-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[#1F2937] text-lg font-medium">Popular in Your Network</h2>
              <button 
                onClick={() => openModal('Popular in Your Network', popularConnections)}
                className="text-[#2563EB] text-sm font-medium">
                See More
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : popularConnections.length > 0 ? (
                popularConnections.map((user, index) => (
                  <div key={user.id || index} className={`w-full ${getCardVisibilityClass(index)}`}>
                    <NetworkCard
                      user={user}
                      onConnectClick={sendRequest}
                      isConnected={false}
                      isRequestSent={outgoingSet.has(user.id)}
                      isRequestPending={incomingSet.has(user.id)}
                    />
                  </div>
                ))
              ) : (
                <p className="col-span-full text-sm text-[#6B7280]">No profiles found</p>
              )}
            </div>
          </div>

          <div className="mt-8 px-4 sm:px-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[#1F2937] text-lg font-medium">People With Similar Profile</h2>
              <button 
                onClick={() => openModal('People With Similar Profile', suggestedConnections["People With Similar Headline"] || [])}
                className="text-[#2563EB] text-sm font-medium">
                See More
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : suggestedConnections['People With Similar Headline'] &&
                suggestedConnections['People With Similar Headline'].length > 0 ? (
                suggestedConnections['People With Similar Headline'].map((user, index) => (
                  <div key={user.id || index} className={`w-full ${getCardVisibilityClass(index)}`}>
                    <NetworkCard
                      user={user}
                      onConnectClick={sendRequest}
                      isConnected={false}
                      isRequestSent={outgoingSet.has(user.id)}
                      isRequestPending={incomingSet.has(user.id)}
                    />
                  </div>
                ))
              ) : (
                <p className="col-span-full text-sm text-[#6B7280]">No profiles found</p>
              )}
            </div>
          </div>

          <div className="mt-8 px-4 sm:px-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[#1F2937] text-lg font-medium">People With Similar Title</h2>
              <button 
                onClick={() => openModal('People With Similar Title', suggestedConnections["People With Similar Title"] || [])}
                className="text-[#2563EB] text-sm font-medium">
                See More
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : suggestedConnections['People With Similar Title'] &&
                suggestedConnections['People With Similar Title'].length > 0 ? (
                suggestedConnections['People With Similar Title'].map((user, index) => (
                  <div key={user.id || index} className={`w-full ${getCardVisibilityClass(index)}`}>
                    <NetworkCard
                      user={user}
                      onConnectClick={sendRequest}
                      isConnected={false}
                      isRequestSent={outgoingSet.has(user.id)}
                      isRequestPending={incomingSet.has(user.id)}
                    />
                  </div>
                ))
              ) : (
                <p className="col-span-full text-sm text-[#6B7280]">No profiles found</p>
              )}
            </div>
          </div>
          <div className="mt-8 px-4 sm:px-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[#1F2937] text-lg font-medium">People With Similar Education</h2>
              <button 
                onClick={() => openModal('People With Similar Education', suggestedConnections["People With Similar Education"] || [])}
                className="text-[#2563EB] text-sm font-medium">
                See More
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : suggestedConnections['People With Similar Education'] &&
                suggestedConnections['People With Similar Education'].length > 0 ? (
                suggestedConnections['People With Similar Education'].map((user, index) => (
                  <div key={user.id || index} className={`w-full ${getCardVisibilityClass(index)}`}>
                    <NetworkCard
                      user={user}
                      onConnectClick={sendRequest}
                      isConnected={false}
                      isRequestSent={outgoingSet.has(user.id)}
                      isRequestPending={incomingSet.has(user.id)}
                    />
                  </div>
                ))
              ) : (
                <p className="col-span-full text-sm text-[#6B7280]">No profiles found</p>
              )}
            </div>
          </div>

        </div>
      </div>
      <SeeMoreModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        users={modalState.users}
        onConnectClick={sendRequest}
        pendingOutgoingIds={outgoingSet}
        pendingIncomingIds={incomingSet}
      />
    </div>
  );
};

export default MainContent;