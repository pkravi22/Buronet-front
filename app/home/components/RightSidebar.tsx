import { FiTrendingUp } from 'react-icons/fi';
import TrendingNowSection from '@/components/TrendingNowSection';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useConnections } from '@/hooks/useConnections';
import { useFollowSuggestions } from '@/hooks/useFollowSuggestions';
import { useAuth } from '@/context/AuthContext';
import FollowButton from '@/components/FollowButton';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';
import { UserPlus } from 'lucide-react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

interface RightSidebarProps {
  scrollSourceRef: React.RefObject<HTMLElement>;
  activeFilter?: 'all' | 'mine';
  onFilterChange?: (filter: 'all' | 'mine') => void;
}

const RightSidebar = ({ scrollSourceRef, activeFilter, onFilterChange }: RightSidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);
  const lastScrollTop = useRef(0);
  const { suggestedGeneralConnections } = useConnections();
  const { user } = useAuth();
  const router = useRouter();
  const { suggestions, isLoading: suggestionsLoading, removeSuggestion } = useFollowSuggestions(5, !!user?.id);

  useEffect(() => {
    const mainEl = scrollSourceRef.current;
    const sideEl = sidebarRef.current;
    if (!mainEl || !sideEl) return;

    const onMainScroll = () => {
      if (syncing.current) return;
      syncing.current = true;
      const delta = mainEl.scrollTop - lastScrollTop.current;
      lastScrollTop.current = mainEl.scrollTop;
      const maxSideScroll = sideEl.scrollHeight - sideEl.clientHeight;
      sideEl.scrollTop = Math.max(0, Math.min(sideEl.scrollTop + delta, maxSideScroll));
      requestAnimationFrame(() => { syncing.current = false; });
    };

    mainEl.addEventListener('scroll', onMainScroll);
    return () => mainEl.removeEventListener('scroll', onMainScroll);
  }, [scrollSourceRef]);

  return (
    <aside className="hidden lg:block xl:w-[260px] laptop:w-[20%] mr-6 mb-6">
      <div
        ref={sidebarRef}
        className="sticky top-[80px] max-h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide"
      >

        {/* Feed Filter Widget */}
        {onFilterChange && (
          <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4 mb-6">
            <h3 className="text-gray-900 font-bold mb-3 text-sm">Feed Filter</h3>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => onFilterChange('all')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${activeFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                All Posts
              </button>
              <button
                onClick={() => onFilterChange('mine')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${activeFilter === 'mine' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                My Posts
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4 mb-6">
          <div className="flex items-center mb-4">
            <FiTrendingUp className="text-[#5E98FF] w-5 h-5" />
            <span className="ml-2 text-[#1F2937] font-semibold">Trending Now</span>
          </div>
          <div>
            <TrendingNowSection />
          </div>
        </div>

        {/* People to Follow */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus size={16} className="text-[#2563EB]" />
              <span className="text-[#1F2937] font-semibold text-sm">People to Follow</span>
            </div>

            {suggestionsLoading ? (
              <div className="flex justify-center py-3"><LoadingSpinner /></div>
            ) : suggestions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">No suggestions right now</p>
            ) : (
              <div className="space-y-3">
                {suggestions.map((s) => (
                  <div key={s.userId} className="flex items-center gap-2">
                    <img
                      src={getProfileImageUrl(s.profilePictureMediaId || s.profilePictureUrl)}
                      alt={s.firstName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 cursor-pointer"
                      onClick={() => router.push(`/profile/${s.userId}`)}
                    />
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => router.push(`/profile/${s.userId}`)}
                    >
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {s.headline || 'Buronet member'}
                      </p>
                    </div>
                    <FollowButton
                      targetUserId={s.userId}
                      initialIsFollowing={false}
                      size="sm"
                      onToggled={(isNowFollowing) => {
                        if (isNowFollowing) removeSuggestion(s.userId);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-[#E5E7EB] text-sm">
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            <a href="#" className="text-[#6B728B] hover:underline">About</a>
            <a href="#" className="text-[#6B728B] hover:underline">Help Center</a>
            <a href="#" className="text-[#6B728B] hover:underline">Privacy &amp; Terms</a>
            <a href="#" className="text-[#6B728B] hover:underline">Advertising</a>
            <a href="#" className="text-[#6B728B] hover:underline">Business Services</a>
            <a href="#" className="text-[#6B728B] hover:underline">Get the App</a>
          </div>
          <p className="text-[#6B728B]">&copy; 2025 Buronet</p>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
