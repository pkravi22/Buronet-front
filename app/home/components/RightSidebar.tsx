import { FiTrendingUp, FiMoreHorizontal } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import TrendingNowSection from '@/components/TrendingNowSection';

// ... (TrendingItem and SuggestedUser components remain the same) ...

const RightSidebar = () => {
  return (
    // Hide on small/medium screens, show on large screens with a fixed width.
    // The parent container should be a grid on `lg` screens. e.g. lg:grid-cols-[1fr_287px]
    <div className="hidden lg:block w-[260px] mr-6 mt-6 mb-6">
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