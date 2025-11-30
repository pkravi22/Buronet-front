'use client';

import Image from 'next/image';
import { FiMessageSquare } from 'react-icons/fi';
import React from 'react';
import { useConnections } from '@/hooks/useConnections'; // Import the new hook
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { ConnectionDto, ConnectionRequestDto, SuggestedUserDto, UserForConnection } from '@/lib/types/connections';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

// --- Reusable card components ---
// RequestCard now takes props from the DTO
interface RequestCardProps {
  request: ConnectionRequestDto;
  onAccept: (requestId: number) => Promise<void>;
  onDecline: (requestId: number) => Promise<void>;
}

const RequestCard = ({ request, onAccept, onDecline }: RequestCardProps) => (
  <div className="bg-[#F9FAFB] rounded-xl p-3">
    <div className="flex justify-between items-start">
      <div className="flex">
        <Image
          src={request.sender.profilePictureUrl || "/default-profile.png"} // Dynamic image URL
          alt={request.sender.firstName || request.sender.username || "User"}
          width={36}
          height={36}
          className="rounded-full"
        />
        <div className="ml-3">
          <h3 className="text-[#1F2937] font-medium">{request.sender.firstName} {request.sender.lastName || request.sender.username}</h3>
          <p className="text-[#6B7280] text-sm">{request.sender.headline}</p>
          <p className="text-[#9CA3AF] text-sm">{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onAccept(request.id)}
          className="w-7 h-7 flex items-center justify-center bg-[#F0FCF4] rounded hover:bg-[#E6FAE9]"
        >
          <svg width="13" height="9" viewBox="0 0 13 9" fill="none">
            <path d="M1 4L4.5 7.5L11.5 1" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={() => onDecline(request.id)}
          className="w-7 h-7 flex items-center justify-center bg-[#FEF2F2] rounded hover:bg-[#FEE2E2]"
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1 1L8 8M8 1L1 8" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
);

// ConnectionCard now takes props from the DTO
interface ConnectionCardProps {
  connection: ConnectionDto;
  onMessageClick: (connection: ConnectionDto) => void;
  // User info can be derived from connection.user1/user2
  currentUserId: string | null;
}

const ConnectionCard = ({ connection, onMessageClick, currentUserId }: ConnectionCardProps) => {
  // Get the other user in the connection
  const otherUser = connection.connectedUser;

  return (
    <div className="flex justify-between items-center">
      <div className="flex">
        <Image
          src={connection.connectedUserProfilePictureUrl || "/default-profile.png"}
          // alt={connection.connectedUserName}
          alt="U"
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="ml-3">
          <h3 className="text-[#1F2937] font-medium">{otherUser.firstName} {otherUser.lastName}</h3>
          <p className="text-[#6B7280] text-sm">{otherUser.headline}</p>
          <p className="text-[#9CA3AF] text-sm mt-1">{formatDistanceToNow(new Date(connection.createdAt), { addSuffix: true })}</p>
        </div>
      </div>
      <button onClick={() => onMessageClick(connection)} className="w-8 h-8 flex items-center justify-center hover:bg-[#F3F4F6] rounded">
        <FiMessageSquare size={20} />
      </button>
    </div>
  );
};


interface GroupCardProps {
  name: string;
  memberCount: number;
  iconBgColor?: string;
}

const GroupCard = ({ name, memberCount, iconBgColor = "bg-[#DBE9FE]" }: GroupCardProps) => (
  <div className="bg-[#F9FAFB] rounded-xl p-4">
    <div className="flex">
      <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM12 8.7H8.7V12H7.3V8.7H4V7.3H7.3V4H8.7V7.3H12V8.7Z" fill="#2563EB"/>
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-[#1F2937] font-medium">{name}</h3>
        <p className="text-[#6B7280] text-sm">{memberCount} members</p>
      </div>
    </div>
    <button className="w-full mt-4 h-[34px] bg-white border border-[#BFD9FE] text-[#2563EB] font-medium rounded flex items-center justify-center hover:bg-[#F8FAFC]">
      <svg className="mr-2" width="11" height="12" viewBox="0 0 11 12" fill="none">
        <path d="M10.5 5.5H6V1C6 0.734784 5.89464 0.48043 5.70711 0.292893C5.51957 0.105357 5.26522 0 5 0C4.73478 0 4.48043 0.105357 4.29289 0.292893C4.10536 0.48043 4 0.734784 4 1V5.5H0.5C0.234784 5.5 -0.0195704 5.60536 -0.207107 5.79289C-0.394643 5.98043 -0.5 6.23478 -0.5 6.5C-0.5 6.76522 -0.394643 7.01957 -0.207107 7.20711C-0.0195704 7.39464 0.234784 7.5 0.5 7.5H4V11C4 11.2652 4.10536 11.5196 4.29289 11.7071C4.48043 11.8946 4.73478 12 5 12C5.26522 12 5.51957 11.8946 5.70711 11.7071C5.89464 11.5196 6 11.2652 6 11V7.5H10.5C10.7652 7.5 11.0196 7.39464 11.2071 7.20711C11.3946 7.01957 11.5 6.76522 11.5 6.5C11.5 6.23478 11.3946 5.98043 11.2071 5.79289C11.0196 5.60536 10.7652 5.5 10.5 5.5Z" fill="#2563EB"/>
      </svg>
      Join Group
    </button>
  </div>
);


const RightBar = () => {
  // Use the new hook to get connections data
  const { connections, pendingRequests, isLoading, error, acceptRequest, declineRequest } = useConnections();
  const { user } = useAuth(); // Get current user for logic
  const router = useRouter(); // For redirecting to messaging

  // Function to navigate to the messaging page with a pre-selected user ID
  const handleMessageClick = (connection: ConnectionDto) => {
    const otherUserId = connection.connectedUserId;
    router.push(`/messaging?userId=${otherUserId}`); // Pass the other user's ID as a query param
  };

  if (isLoading) {
    return <div className="p-6 text-center"><LoadingSpinner /></div>;
  }
  if (error) {
    return <div className="p-6 text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="hidden lg:block xl:w-[260px] laptop:w-[20%] mr-6 shrink-0 sticky top-6">
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6 mt-6">
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#1F2937] font-medium">Pending Requests</h2>
            <span className="text-[#6B7280] text-sm">{pendingRequests.length} requests</span>
          </div>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onAccept={acceptRequest}
                onDecline={declineRequest}
              />
            ))}
          </div>
          <button className="w-full text-[#2563EB] font-medium mt-[40px] py-2 hover:bg-[#F3F4F6] rounded">
            View All Requests
          </button>
        </div>

        <div className="mt-6 mb-10">
          <h2 className="text-[#1F2937] font-medium mb-4">Recent Connections</h2>
          <div className="space-y-4">
            {connections.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onMessageClick={handleMessageClick} // Pass the handler
                currentUserId={user?.id || null}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-[#1F2937] font-medium mb-4">Groups You Might Like</h2>
          <div className="space-y-4">
            {/* The logic for fetching and rendering groups would be here */}
            {/* For now, just rendering static data or a placeholder */}
            <div className="bg-[#F9FAFB] rounded-xl p-4 text-center text-gray-500">
              Groups suggestions coming soon...
            </div>
          </div>
          <button className="w-full text-[#2563EB] font-medium mt-[40px] py-2 hover:bg-[#F3F4F6] rounded">
            Discover More Groups
          </button>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-[#E5E7EB] text-sm">
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            <a href="#" className="text-[#6B728B] hover:underline">About</a>
            <a href="#" className="text-[#6B728B] hover:underline">Help Center</a>
            <a href="#" className="text-[#6B728B] hover:underline">Privacy & Terms</a>
            <a href="#" className="text-[#6B728B] hover:underline">Advertising</a>
            <a href="#" className="text-[#6B728B] hover:underline">Business Services</a>
            <a href="#" className="text-[#6B728B] hover:underline">Get the App</a>
          </div>
          <p className="text-[#6B728B]">© 2025 Buronet</p>
        </div>
    </div>
  );
};

export default RightBar;