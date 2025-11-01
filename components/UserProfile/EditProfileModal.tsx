// components/UserProfile/EditProfileModal.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserProfile, UpdateUserProfileDto } from '../../lib/types/user'; // Import from the consolidated types folder
import { useUserProfile } from '../../hooks/useUserProfile';
import { format } from 'date-fns';

interface EditProfileModalProps {
  userProfile: UserProfile; // Type is UserProfile
  onClose: () => void;
}

type UserProfileFormData = Omit<UpdateUserProfileDto, 'dateOfBirth'> & {
  dateOfBirth: string; 
};

const EditProfileModal: React.FC<EditProfileModalProps> = ({ userProfile, onClose }) => {
  const { updateProfile } = useUserProfile();
  const [formData, setFormData] = useState<UserProfileFormData>({
    firstName: userProfile.firstName || '',
    lastName: userProfile.lastName || '',
    headline: userProfile.headline || '',
    bio: userProfile.bio || '',
    dateOfBirth: userProfile.dateOfBirth ? format(new Date(userProfile.dateOfBirth), 'yyyy-MM-dd') : '',
    phoneNumber: userProfile.phoneNumber || '',
    addressLine1: userProfile.addressLine1 || '',
    addressLine2: userProfile.addressLine2 || '',
    city: userProfile.city || '',
    stateProvince: userProfile.stateProvince || '',
    zipCode: userProfile.zipCode || '',
    country: userProfile.country || '',
    profilePictureUrl: userProfile.profilePictureUrl || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const dataToSend: UpdateUserProfileDto = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
      );
      await updateProfile(dataToSend);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-2xl font-bold text-gray-800">Edit Your Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>
        <div className="p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Note: Username and Email are NOT editable in this modal as they belong to the core User table,
                which is assumed to be managed by the authentication system or a separate account settings page. */}
            <div>
              <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="headline" className="block text-gray-700 text-sm font-bold mb-2">Headline</label>
              <input type="text" id="headline" name="headline" value={formData.headline || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-2">Bio</label>
              <textarea id="bio" name="bio" value={formData.bio || ''} onChange={handleChange} rows={3} className="form-textarea"></textarea>
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-gray-700 text-sm font-bold mb-2">Date of Birth</label>
              <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
              <input type="text" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="addressLine1" className="block text-gray-700 text-sm font-bold mb-2">Address Line 1</label>
              <input type="text" id="addressLine1" name="addressLine1" value={formData.addressLine1 || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="addressLine2" className="block text-gray-700 text-sm font-bold mb-2">Address Line 2</label>
              <input type="text" id="addressLine2" name="addressLine2" value={formData.addressLine2 || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">City</label>
              <input type="text" id="city" name="city" value={formData.city || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label htmlFor="stateProvince" className="block text-gray-700 text-sm font-bold mb-2">State/Province</label>
              <input type="text" id="stateProvince" name="stateProvince" value={formData.stateProvince || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-gray-700 text-sm font-bold mb-2">Zip Code</label>
              <input type="text" id="zipCode" name="zipCode" value={formData.zipCode || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-2">Country</label>
              <input type="text" id="country" name="country" value={formData.country || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="profilePictureUrl" className="block text-gray-700 text-sm font-bold mb-2">Profile Picture URL</label>
              <input type="url" id="profilePictureUrl" name="profilePictureUrl" value={formData.profilePictureUrl || ''} onChange={handleChange} className="form-input" placeholder="https://example.com/your-image.jpg" />
            </div>

            <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;