import { FiTrendingUp, FiMoreHorizontal } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import TrendingNowSection from '@/components/TrendingNowSection';
import { useEffect, useState, useRef } from 'react';
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

const RightSidebar = ({ scrollSourceRef }: { scrollSourceRef: React.RefObject<HTMLElement> }) => {
  // const [suggestedConnections, setSuggestedConnections] = useState<SuggestedUserDto[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);
  const lastScrollTop = useRef(0);
  const { suggestedGeneralConnections } = useConnections();

  useEffect(() => {
        console.log(
  "effect ran",
  scrollSourceRef.current,
  sidebarRef.current
);
    const mainEl = scrollSourceRef.current;
    const sideEl = sidebarRef.current;
    if (!mainEl || !sideEl) return;

    const onMainScroll = () => {
      if (syncing.current) return;
      syncing.current = true;

      const delta = mainEl.scrollTop - lastScrollTop.current;
      lastScrollTop.current = mainEl.scrollTop;

      // Apply SAME pixel delta
      const maxSideScroll =
        sideEl.scrollHeight - sideEl.clientHeight;

      sideEl.scrollTop = Math.max(
        0,
        Math.min(sideEl.scrollTop + delta, maxSideScroll)
      );

      requestAnimationFrame(() => {
        syncing.current = false;
      });
    };

    mainEl.addEventListener('scroll', onMainScroll);
    return () => mainEl.removeEventListener('scroll', onMainScroll);
  }, [scrollSourceRef]);
  // useEffect(() => {
  //   // This effect runs once when the component mounts
  //   const suggestedConnectionsResponse = get<SuggestedUserDto[]>('/connections/general-suggestions');
  //   console.log('Suggested Connections Response:', suggestedConnectionsResponse);
  //   setSuggestedConnections(suggestedConnectionsResponse);
  // }, []);

  return (
    // Hide on small/medium screens, show on large screens with a fixed width.
    // The parent container should be a grid on `lg` screens. e.g. lg:grid-cols-[1fr_287px]
    <aside className="hidden lg:block xl:w-[260px] laptop:w-[30%] mr-6 mb-6">
      <div
        ref={sidebarRef}
        className="
          sticky
          top-[80px]
          max-h-[calc(100vh-100px)]
          overflow-y-auto
          scrollbar-hide
        "
      >
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4 mb-6">
        <div className="flex items-center mb-4">
          <FiTrendingUp className="text-[#5E98FF] w-5 h-5" />
          <span className="ml-2 text-[#1F2937] font-semibold">Trending Now</span>
        </div>
        <div>
          <TrendingNowSection />
          <TrendingNowSection />
          <TrendingNowSection />
          <TrendingNowSection />
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
    </aside>
  );
};

export default RightSidebar;