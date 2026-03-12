// components/UserProfile/EditProfileModal.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserProfile, UpdateUserProfileDto } from '../../lib/types/user'; // Import from the consolidated types folder
import { useUserProfile } from '../../hooks/useUserProfile';
import { postApi } from '@/lib/api';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';
import { toDateOnly } from '@/lib/dates';

interface EditProfileModalProps {
  userProfile: UserProfile; // Type is UserProfile
  onClose: () => void;
  onSuccess?: () => void;
}

type UploadImageResponse = {
  profilePictureMediaId: string;
  profilePictureUrl: string;
}

type UserProfileFormData = Omit<UpdateUserProfileDto, 'dateOfBirth'> & {
  dateOfBirth: string;
  username?: string;
};

const EditProfileModal: React.FC<EditProfileModalProps> = ({ userProfile, onClose, onSuccess }) => {
  const { updateProfile } = useUserProfile();
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<UserProfileFormData>({
    firstName: userProfile.firstName || '',
    lastName: userProfile.lastName || '',
    headline: userProfile.headline || '',
    bio: userProfile.bio || '',
    dateOfBirth: toDateOnly(userProfile.dateOfBirth) || '',
    phoneNumber: userProfile.phoneNumber || '',
    addressLine1: userProfile.addressLine1 || '',
    addressLine2: userProfile.addressLine2 || '',
    city: userProfile.city || '',
    stateProvince: userProfile.stateProvince || '',
    zipCode: userProfile.zipCode || '',
    country: userProfile.country || '',
    username: userProfile.username || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    setProfileImageFile(e.target.files[0]);
  }
};

  // Validation function
  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};

    // Username validation
    if (formData.username) {
      if (formData.username.length < 5) {
        errors.username = 'Username must be at least 5 characters.';
      } else if (formData.username.length > 15) {
        errors.username = 'Username must not exceed 15 characters.';
      }
    }

    // First Name validation
    if (!formData.firstName || formData.firstName.trim() === '') {
      errors.firstName = 'First Name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First Name must be at least 2 characters';
    } else if (formData.firstName.trim().length > 50) {
      errors.firstName = 'First Name must not exceed 50 characters';
    }

    // Last Name validation
    if (!formData.lastName || formData.lastName.trim() === '') {
      errors.lastName = 'Last Name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last Name must be at least 2 characters';
    } else if (formData.lastName.trim().length > 50) {
      errors.lastName = 'Last Name must not exceed 50 characters';
    }

    // Headline validation
    if (!formData.headline || formData.headline.trim() === '') {
      errors.headline = 'Headline is required';
    } else if (formData.headline.trim().length < 5) {
      errors.headline = 'Headline must be at least 5 characters';
    } else if (formData.headline.trim().length > 160) {
      errors.headline = 'Headline must not exceed 160 characters';
    }

    // Date of Birth validation
    if (!formData.dateOfBirth || formData.dateOfBirth.trim() === '') {
      errors.dateOfBirth = 'Date of Birth is required';
    } else {
      const dobDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dobDate.getFullYear();
      
      if (dobDate > today) {
        errors.dateOfBirth = 'Date of Birth cannot be in the future';
      } else if (age < 13) {
        errors.dateOfBirth = 'You must be at least 13 years old';
      } else if (age > 120) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault?.();
    
    // Validate fields before submitting
    if (!validateFields()) {
      setError('Please fix the errors above before saving.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const dataToSend: UpdateUserProfileDto = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
      );

      // `dateOfBirth` is a date-only field; send as `YYYY-MM-DD` to avoid timezone drift.
      // Backend should treat this as a date-only value.
      if (profileImageFile) {
        const formDataImage = new FormData();
        formDataImage.append("file", profileImageFile);
        // const res = await postApi("/users/profile/upload_picture", { body: formData, isFormData: true });
        const res: UploadImageResponse = await postApi(`/Users/profile/upload_picture`, formDataImage);

        if (!res) {
          throw new Error("Failed to upload profile picture");
        } else {
          dataToSend.profilePictureMediaId = res.profilePictureMediaId;
        }
      }
      await updateProfile(dataToSend);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden bg-white rounded-lg text-left shadow-xl transition-all w-full max-w-2xl my-8 sm:w-full">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-2xl font-bold text-gray-800">Edit Your Profile</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>
        <div className="p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Note: Username and Email are NOT editable in this modal as they belong to the core User table,
                which is assumed to be managed by the authentication system or a separate account settings page. */}
            <div>
              <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">First Name <span className="text-red-500">*</span></label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName || ''} onChange={handleChange} className={`form-input ${fieldErrors.firstName ? 'border-red-500' : ''}`} />
              {fieldErrors.firstName && <p className="text-red-500 text-sm mt-1">{fieldErrors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">Last Name <span className="text-red-500">*</span></label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName || ''} onChange={handleChange} className={`form-input ${fieldErrors.lastName ? 'border-red-500' : ''}`} />
              {fieldErrors.lastName && <p className="text-red-500 text-sm mt-1">{fieldErrors.lastName}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="headline" className="block text-gray-700 text-sm font-bold mb-2">Headline <span className="text-red-500">*</span></label>
              <input type="text" id="headline" name="headline" value={formData.headline || ''} onChange={handleChange} className={`form-input ${fieldErrors.headline ? 'border-red-500' : ''}`} />
              {fieldErrors.headline && <p className="text-red-500 text-sm mt-1">{fieldErrors.headline}</p>}
            </div>
            <div>
              <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username</label>
              <input type="text" id="username" name="username" value={formData.username || ''} onChange={handleChange} maxLength={15} className={`form-input ${fieldErrors.username ? 'border-red-500' : ''}`} />
              {fieldErrors.username && <p className="text-red-500 text-sm mt-1">{fieldErrors.username}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-2">Bio</label>
              <textarea id="bio" name="bio" value={formData.bio || ''} onChange={handleChange} rows={3} className="form-textarea"></textarea>
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-gray-700 text-sm font-bold mb-2">Date of Birth <span className="text-red-500">*</span></label>
              <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} className={`form-input ${fieldErrors.dateOfBirth ? 'border-red-500' : ''}`} />
              {fieldErrors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{fieldErrors.dateOfBirth}</p>}
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
            {/* <div className="md:col-span-2">
              <label htmlFor="profilePictureUrl" className="block text-gray-700 text-sm font-bold mb-2">Profile Picture URL</label>
              <input type="url" id="profilePictureUrl" name="profilePictureUrl" value={formData.profilePictureUrl || ''} onChange={handleChange} className="form-input" placeholder="https://example.com/your-image.jpg" />
            </div> */}

            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Profile Picture
              </label>

              <div className="flex items-center space-x-4">
                <img
                  src={getProfileImageUrl(userProfile.profilePictureUrl)}
                  alt="Current profile"
                  className="w-16 h-16 rounded-full object-cover"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block text-sm text-gray-600"
                />
              </div>
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
                onClick={handleSubmit}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
     </div>
    </div>
  );
};

export default EditProfileModal;