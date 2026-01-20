// components/UserProfile/UserProfileHeader.tsx
'use client'; // This is a client component

import Image from 'next/image';
import { UserProfile } from '../../lib/types/user'; // Import from the consolidated types folder
import { getProfileImageUrl } from '@/lib/helpers/profileImage';

interface UserProfileHeaderProps {
  userProfile: UserProfile; // Type is UserProfile
  onEdit: () => void; // Callback to open main profile edit modal
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ userProfile, onEdit }) => {
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
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={onEdit}
          className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-sm"
        >
          Edit Profile
        </button>
        {/* Add Share/More options if needed from the image */}
      </div>
    </div>
  );
};

export default UserProfileHeader;