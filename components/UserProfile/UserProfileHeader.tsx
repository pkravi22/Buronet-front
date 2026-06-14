// components/UserProfile/UserProfileHeader.tsx
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserProfile } from '../../lib/types/user';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';
import { useFollow } from '@/hooks/useFollow';

interface UserProfileHeaderProps {
  userProfile: UserProfile;
  onEdit: () => void;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ userProfile, onEdit }) => {
  const { getFollowStatus } = useFollow();
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);

  useEffect(() => {
    if (!userProfile?.id) return;
    getFollowStatus(userProfile.id).then((s) => {
      if (s) {
        setFollowerCount(s.followerCount);
        setFollowingCount(s.followingCount);
      }
    });
  }, [userProfile?.id, getFollowStatus]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28 mb-4 rounded-full overflow-hidden border-4 border-blue-200">
          <Image
            src={getProfileImageUrl(userProfile.profilePictureUrl)}
            alt="Profile Picture"
            layout="fill"
            objectFit="cover"
            className="rounded-full"
          />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
          {userProfile.firstName || userProfile.username || 'N/A'} {userProfile.lastName || ''}
        </h2>
        <p className="text-blue-600 text-sm mb-2 font-medium">
          {userProfile.headline || 'No Headline'}
        </p>
        <p className="text-gray-600 text-center text-sm mb-4">
          {userProfile.bio || 'No bio available. Click "Edit Profile" to add one.'}
        </p>

        {/* Follower / Following counts */}
        <div className="flex gap-6 mb-4">
          <Link href="/followers" className="text-center group">
            <p className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {followerCount ?? '—'}
            </p>
            <p className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">Followers</p>
          </Link>
          <div className="w-px bg-gray-200" />
          <Link href="/followers" className="text-center group">
            <p className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {followingCount ?? '—'}
            </p>
            <p className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">Following</p>
          </Link>
        </div>
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={onEdit}
          className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-sm"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default UserProfileHeader;
