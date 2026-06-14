"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFollow, FollowUserDto } from '@/hooks/useFollow';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { AlertModal } from '@/components/AlertModal';
import { useRouter } from 'next/navigation';
import { User, Users, Check } from 'lucide-react';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';

interface FollowCardProps {
  user: FollowUserDto;
  onFollowToggle: (userId: string) => Promise<void>;
  isLoadingAction: boolean;
}

const FollowCard: React.FC<FollowCardProps> = ({ user, onFollowToggle, isLoadingAction }) => {
  const router = useRouter();

  const handleOpenClick = () => {
    if (!user.userId) return;
    const uid = user.userId;
    router.push("/profile/" + uid);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm cursor-pointer" onClick={handleOpenClick}>
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
            {user.headline ? 
              <p className="text-[#6B7280] text-sm leading-snug line-clamp-2">{user.headline}</p> : 
              <p className="text-[#6B7280] text-sm italic text-center">No headline</p>
            }
          </div>
        </div>
        
        <button
          disabled={isLoadingAction}
          onClick={(e) => {
            e.stopPropagation();
            onFollowToggle(user.userId);
          }}
          className={`mt-4 w-full h-10 rounded flex items-center justify-center gap-2 transition-colors ${
            isLoadingAction ? 'bg-gray-200 text-gray-500 cursor-not-allowed' :
            user.isFollowedByCurrentUser
              ? 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
              : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
          }`}
        >
          {user.isFollowedByCurrentUser ? (
            <>
              <Check size={16} /> Following
            </>
          ) : (
            <>
              <Users size={16} /> Follow
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const MainContent = () => {
  const { getFollowers, getFollowing, toggleFollow, isLoading, error, clearError } = useFollow();
  const { user: authUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = useState<FollowUserDto[]>([]);
  const [following, setFollowing] = useState<FollowUserDto[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingToggleId, setLoadingToggleId] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser?.id) return;

    const fetchData = async () => {
      setLoadingInitial(true);
      const [followersData, followingData] = await Promise.all([
        getFollowers(authUser.id),
        getFollowing(authUser.id)
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
      
      // Optimistically update lists
      setFollowers(prev => prev.map(u => u.userId === userId ? { ...u, isFollowedByCurrentUser: isNowFollowing } : u));
      setFollowing(prev => prev.map(u => u.userId === userId ? { ...u, isFollowedByCurrentUser: isNowFollowing } : u));
      
      // If we unfollowed from the 'following' tab, we might want to remove them, 
      // but keeping them with 'Follow' button is also standard UX. Let's keep them and update state.
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingToggleId(null);
    }
  };

  const activeList = activeTab === 'followers' ? followers : following;

  return (
    <div className="flex-1">
      {error && <AlertModal duration={4000} message={error} type="error" onClose={clearError} />}
      
      <div className="flex justify-center w-full">
        <div className="w-[640px]">
          
          <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] mb-6 mt-2 overflow-hidden">
            <div className="flex w-full border-b border-[#E5E7EB]">
              <button
                className={`flex-1 py-4 text-center font-medium text-sm transition-colors relative ${activeTab === 'followers' ? 'text-[#2563EB]' : 'text-[#6B7280] hover:text-[#374151]'}`}
                onClick={() => setActiveTab('followers')}
              >
                Followers ({followers.length})
                {activeTab === 'followers' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2563EB]"></div>
                )}
              </button>
              <button
                className={`flex-1 py-4 text-center font-medium text-sm transition-colors relative ${activeTab === 'following' ? 'text-[#2563EB]' : 'text-[#6B7280] hover:text-[#374151]'}`}
                onClick={() => setActiveTab('following')}
              >
                Following ({following.length})
                {activeTab === 'following' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2563EB]"></div>
                )}
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-0">
            {loadingInitial ? (
              <div className="flex justify-center mt-12">
                <LoadingSpinner />
              </div>
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
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-[#2563EB]" size={32} />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
