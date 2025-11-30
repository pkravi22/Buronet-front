import { FiTrendingUp, FiMoreHorizontal } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import TrendingNowSection from '@/components/TrendingNowSection';
import { useEffect, useState } from 'react';
import { get } from '@/lib/api';
import { SuggestedUserDto } from '@/lib/types/connections';
import { useConnections } from '@/hooks/useConnections';

interface SuggestedUserProps {
  name: string;
  role: string;
  imageUrl: string;
}



// ... (TrendingItem and SuggestedUser components remain the same) ...
const SuggestedUser: React.FC<SuggestedUserProps> = ({ name, role, imageUrl }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center">
        <img src={imageUrl} alt="U" className="w-10 h-10 rounded-full" />
        <div className="ml-3">
          <h3 className="text-[#1F2937] text-base font-medium">{name}</h3>
          <p className="text-[#6B728B] text-sm">{role}</p>
        </div>
      </div>
      <button className="text-[#2563EB] text-sm font-medium px-4 py-1 rounded hover:bg-[#EEF2FF]">
        Connect
      </button>
    </div>
  );
};

const RightSidebar = () => {
  // const [suggestedConnections, setSuggestedConnections] = useState<SuggestedUserDto[]>([]);
  const { suggestedGeneralConnections } = useConnections();
  // useEffect(() => {
  //   // This effect runs once when the component mounts
  //   const suggestedConnectionsResponse = get<SuggestedUserDto[]>('/connections/general-suggestions');
  //   console.log('Suggested Connections Response:', suggestedConnectionsResponse);
  //   setSuggestedConnections(suggestedConnectionsResponse);
  // }, []);

  return (
    // Hide on small/medium screens, show on large screens with a fixed width.
    // The parent container should be a grid on `lg` screens. e.g. lg:grid-cols-[1fr_287px]
    <div className="hidden lg:block xl:w-[260px] laptop:w-[30%] mr-6 mt-6 mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4 mb-6">
        <div className="flex items-center mb-4">
          <FiTrendingUp className="text-[#5E98FF] w-5 h-5" />
          <span className="ml-2 text-[#1F2937] font-semibold">Trending Now</span>
        </div>
        <div>
          <TrendingNowSection />
        </div>
        
        <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
          <div className="flex items-center mb-4">
            <span className="text-[#1F2937] font-semibold">Suggested For You</span>
          </div>
          <div>
            {/* SuggestedUser components go here... */}
            <div>
              {suggestedGeneralConnections.map(user => (
                <SuggestedUser
                  key={user.id}
                  name={user.firstName + ' ' + user.lastName}
                  role={user.headline || 'New Member'}
                  imageUrl="/placeholder-avatar.jpg"
                />
              ))}
           
            {/* <SuggestedUser
              name="Sarah Chen"
              role="Product Designer at TechCo"
              imageUrl="/placeholder-avatar.jpg"
            />
            <SuggestedUser
              name="Michael Brown"
              role="UI Developer at WebStudio"
              imageUrl="/placeholder-avatar.jpg"
            />*/}
          </div>
          </div>
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

export default RightSidebar;