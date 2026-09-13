"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFollow, FollowUserDto } from '@/hooks/useFollow';
import { useFollowSuggestions } from '@/hooks/useFollowSuggestions';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { AlertModal } from '@/components/AlertModal';
import { useRouter } from 'next/navigation';
import { User, Users, Check, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';

const PAGE_SIZE = 9;

interface FollowCardProps {
  user: FollowUserDto;
  onFollowToggle: (userId: string) => Promise<void>;
  isLoadingAction: boolean;
}

const FollowCard: React.FC<FollowCardProps> = ({ user, onFollowToggle, isLoadingAction }) => {
  const router = useRouter();
  return (
    <div className="bg-white rounded-xl shadow-sm cursor-pointer" onClick={() => router.push('/profile/' + user.userId)}>
      <div className="p-3 sm:p-4 h-full flex flex-col">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-2 bg-[#F3F4F6] rounded-full flex items-center justify-center overflow-hidden">
            {user.profilePictureUrl || user.profilePictureMediaId ? (
               <img src={getProfileImageUrl(user.profilePictureUrl || user.profilePictureMediaId)} alt={user.firstName} className="w-full h-full object-cover" />
            ) : (
               <User size={32} className="text-[#6B7280]" />
            )}
          </div>
          <h3 className="text-[#1F2937] text-base font-medium text-center">{user.firstName} {user.lastName}</h3>
          <div className="mt-0.5 text-center h-10 overflow-hidden">
            {user.headline
              ? <p className="text-[#6B7280] text-sm leading-snug line-clamp-2">{user.headline}</p>
              : <p className="text-[#6B7280] text-sm italic text-center">No headline</p>
            }
          </div>
        </div>
        <button
          disabled={isLoadingAction}
          onClick={(e) => { e.stopPropagation(); onFollowToggle(user.userId); }}
          className={`mt-4 w-full h-10 rounded flex items-center justify-center gap-2 transition-colors ${
            isLoadingAction ? 'bg-gray-200 text-gray-500 cursor-not-allowed' :
            user.isFollowedByCurrentUser
              ? 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
              : 'bg-[#0096c7] text-white hover:bg-[#0e7490]'
          }`}
        >
          {user.isFollowedByCurrentUser ? <><Check size={16} /> Following</> : <><Users size={16} /> Follow</>}
        </button>
      </div>
    </div>
  );
};

const MainContent = () => {
  const { getFollowers, getFollowing, toggleFollow, error, clearError } = useFollow();
  const { user: authUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'suggestions' | 'followers' | 'following'>('suggestions');
  const [followers, setFollowers] = useState<FollowUserDto[]>([]);
  const [following, setFollowing] = useState<FollowUserDto[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingToggleId, setLoadingToggleId] = useState<string | null>(null);

  const { suggestions, isLoading: suggestionsLoading, removeSuggestion } = useFollowSuggestions(50, !!authUser?.id);
  const [suggestionsPage, setSuggestionsPage] = useState(0);
  const totalSuggestionsPages = Math.max(1, Math.ceil(suggestions.length / PAGE_SIZE));
  const pagedSuggestions = suggestions.slice(suggestionsPage * PAGE_SIZE, (suggestionsPage + 1) * PAGE_SIZE);

  useEffect(() => {
    if (!authUser?.id) return;
    const fetchData = async () => {
      setLoadingInitial(true);
      const [followersData, followingData] = await Promise.all([
        getFollowers(authUser.id),
        getFollowing(authUser.id),
      ]);
      if (followersData) setFollowers(followersData.data);
      if (followingData) setFollowing(followingData.data);
      setLoadingInitial(false);
    };
    fetchData();
  }, [authUser?.id, getFollowers, getFollowing]);

  const handleToggleFollow = async (userId: string) => {
    setLoadingToggleId(userId);
    try {
      const res = await toggleFollow(userId);
      const isNowFollowing = res.isFollowing;
      setFollowers(prev => prev.map(u => u.userId === userId ? { ...u, isFollowedByCurrentUser: isNowFollowing } : u));
      setFollowing(prev => prev.map(u => u.userId === userId ? { ...u, isFollowedByCurrentUser: isNowFollowing } : u));
    } catch (err) { console.error(err); }
    finally { setLoadingToggleId(null); }
  };

  const handleSuggestionFollow = async (userId: string) => {
    setLoadingToggleId(userId);
    try {
      await toggleFollow(userId);
      removeSuggestion(userId);
      const remaining = suggestions.length - 1;
      const maxPage = Math.max(0, Math.ceil(remaining / PAGE_SIZE) - 1);
      if (suggestionsPage > maxPage) setSuggestionsPage(maxPage);
    } catch (err) { console.error(err); }
    finally { setLoadingToggleId(null); }
  };

  const activeList = activeTab === 'followers' ? followers : following;

  const tabs = [
    { key: 'suggestions' as const, label: 'Suggestions',                       icon: <UserPlus size={16} /> },
    { key: 'followers'   as const, label: `Followers (${followers.length})`,   icon: <Users size={16} /> },
    { key: 'following'   as const, label: `Following (${following.length})`,   icon: <Users size={16} /> },
  ];

  return (
    <div className="flex-1">
      {error && <AlertModal duration={4000} message={error} type="error" onClose={clearError} />}
      <div className="flex justify-center w-full">
        <div className="w-[640px]">

          {/* Tab bar */}
          <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] mb-6 mt-2 overflow-hidden">
            <div className="flex w-full border-b border-[#E5E7EB]">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 font-semibold text-[15px] transition-colors relative
                    ${activeTab === tab.key ? 'text-[#0096c7]' : 'text-[#6B7280] hover:text-[#374151]'}`}
                >
                  {tab.icon}{tab.label}
                  {activeTab === tab.key && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0096c7]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 sm:px-0">

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <>
                {suggestionsLoading ? (
                  <div className="flex justify-center mt-12"><LoadingSpinner /></div>
                ) : suggestions.length === 0 ? (
                  <div className="text-center mt-12 bg-white rounded-xl p-8 shadow-sm">
                    <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="text-[#0096c7]" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No suggestions right now</h3>
                    <p className="text-gray-500">Check back later for people you may want to follow.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pagedSuggestions.map((s) => (
                        <FollowCard
                          key={s.userId}
                          user={{ ...s, isFollowedByCurrentUser: false }}
                          onFollowToggle={handleSuggestionFollow}
                          isLoadingAction={loadingToggleId === s.userId}
                        />
                      ))}
                    </div>
                    {totalSuggestionsPages > 1 && (
                      <div className="flex items-center justify-between mt-6 bg-white rounded-lg border border-[#E5E7EB] px-4 py-3 shadow-sm">
                        <button
                          disabled={suggestionsPage === 0}
                          onClick={() => setSuggestionsPage(p => Math.max(0, p - 1))}
                          className="flex items-center gap-1.5 text-sm font-medium text-[#0096c7] disabled:text-gray-300 disabled:cursor-not-allowed hover:text-[#0e7490] transition-colors"
                        >
                          <ChevronLeft size={18} /> Previous
                        </button>
                        <span className="text-sm text-gray-500">Page {suggestionsPage + 1} of {totalSuggestionsPages}</span>
                        <button
                          disabled={suggestionsPage >= totalSuggestionsPages - 1}
                          onClick={() => setSuggestionsPage(p => Math.min(totalSuggestionsPages - 1, p + 1))}
                          className="flex items-center gap-1.5 text-sm font-medium text-[#0096c7] disabled:text-gray-300 disabled:cursor-not-allowed hover:text-[#0e7490] transition-colors"
                        >
                          Next <ChevronRight size={18} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Followers / Following Tabs */}
            {(activeTab === 'followers' || activeTab === 'following') && (
              <>
                {loadingInitial ? (
                  <div className="flex justify-center mt-12"><LoadingSpinner /></div>
                ) : activeList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeList.map((u, i) => (
                      <FollowCard
                        key={`${u.userId}-${i}`}
                        user={u}
                        onFollowToggle={handleToggleFollow}
                        isLoadingAction={loadingToggleId === u.userId}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center mt-12 bg-white rounded-xl p-8 shadow-sm">
                    <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="text-[#0096c7]" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {activeTab === 'followers' ? 'No followers yet' : 'Not following anyone'}
                    </h3>
                    <p className="text-gray-500">
                      {activeTab === 'followers'
                        ? "When people follow you, they'll show up here."
                        : "When you follow people, you'll see them here."}
                    </p>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;