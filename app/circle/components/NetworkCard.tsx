import { SuggestedUserDto } from "@/lib/types/connections";
import { User, Users } from "lucide-react";

interface NetworkCardProps {
  user: SuggestedUserDto;
  onConnectClick: (receiverId: string) => Promise<void>;
  isConnected?: boolean;
}

export const NetworkCard: React.FC<NetworkCardProps> = ({ user, onConnectClick, isConnected }) => (
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