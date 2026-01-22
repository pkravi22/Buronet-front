// app/complete-profile/page.tsx
'use client'; // This component uses React hooks and needs client-side interactivity

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '../../components/UI/LoadingSpinner'; // Assuming this component exists
import { useAuth } from '../../context/AuthContext'; // Assuming useAuth provides user, isLoading, etc.
import { UserProfile, UpdateUserProfileDto } from '../../lib/types/user'; // Assuming these types exist
import { get, postApi, put } from '../../lib/api'; // Import 'get' and 'put' from your API utility
import { useUserProfile } from '@/hooks/useUserProfile';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';
import { toDateOnly } from '@/lib/dates';

type UploadImageResponse = {
  profilePictureMediaId: string;
  profilePictureUrl: string;
}

const CompleteProfilePage: React.FC = () => {
  // Destructure values from AuthContext
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const { userProfile, isLoading: isProfileLoading } = useUserProfile(); 
  const router = useRouter();

  // State for form data, initialized with empty strings or undefined
  const [profileData, setProfileData] = useState<UpdateUserProfileDto>({
    firstName: '',
    lastName: '',
    dateOfBirth: '', // Date-only string for <input type="date">
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    zipCode: '',
    country: '',
    profilePictureUrl: '',
    bio: '',
    headline: '',
  });

  // States for form submission and data fetching
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true); // Start as true, as we'll fetch data on mount
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  // --- Redirect Logic ---
  // Redirect if not logged in (shouldn't happen if coming from register, but good guard)
  useEffect(() => {
    // If authentication status has been determined (not loading) AND no user is found
    if (!authLoading && !user && userProfile) {
      router.push('/login'); // Redirect to login page
    }
  }, [user, authLoading, router]); // Dependencies: re-run when user or authLoading changes

  // --- Data Fetching Logic (to pre-fill the form) ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Only proceed if user is loaded and not null, and we're not currently authenticating
      if (authLoading || !user) {
        // If auth is still loading, or no user is logged in, don't try to fetch profile.
        // If auth finished and no user, stop fetch loading as there's no profile to fetch.
        if (!authLoading && !user) {
            setFetchLoading(false);
        }
        return;
      }

      setFetchLoading(true); // Indicate that profile data is being fetched
      setFetchError(null); // Clear any previous fetch errors

      try {
        // --- FIX: Use the 'get' utility from lib/api.ts ---
        // This ensures the correct API_BASE_URL is used and Authorization header is added.
        const data: UserProfile = await get<UserProfile>('/Users/profile'); // Call the /userprofile/me endpoint

        // Map fetched data to UpdateUserProfileDto format for form state
        setProfileData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          // Keep date-only fields stable in UI.
          dateOfBirth: toDateOnly(data.dateOfBirth) || '',
          phoneNumber: data.phoneNumber || '',
          addressLine1: data.addressLine1 || '',
          addressLine2: data.addressLine2 || '',
          city: data.city || '',
          stateProvince: data.stateProvince || '',
          zipCode: data.zipCode || '',
          country: data.country || '',
          profilePictureUrl: data.profilePictureUrl || '',
          bio: data.bio || '',
          headline: data.headline || '',
        });
      } catch (err: any) {
        setFetchError(err.message || 'An unexpected error occurred while fetching profile.');
      } finally {
        setFetchLoading(false); // Ensure loading state is turned off
      }
    };

    fetchUserProfile();
  }, [user, authLoading]); // Re-fetch when user object or authentication loading status changes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfileImageFile(e.target.files[0]);
    }
  };

  // --- Form Field Change Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Store as date-only string (YYYY-MM-DD) or empty.
    setProfileData(prev => ({
      ...prev,
      [name]: value || ''
    }));
  };

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (isSubmitting || !user) return; // Prevent double submission or submission if no user

    setIsSubmitting(true); // Indicate submission is in progress
    setFetchError(null); // Clear previous errors

    try {
      // --- FIX: Use the 'put' utility from lib/api.ts ---
      // This ensures the correct API_BASE_URL is used and Authorization header is added.
      if (profileImageFile) {
              const formData = new FormData();
              formData.append("file", profileImageFile);
              // const res = await postApi("/users/profile/upload_picture", { body: formData, isFormData: true });
              const res: UploadImageResponse = await postApi(`/users/profile/upload_picture`, formData);
      
              if (!res) {
                throw new Error("Failed to upload profile picture");
              } else {
                profileData.profilePictureMediaId = res.profilePictureMediaId;
              }
            }
      await put('/Users/profile', { // Call the /userprofile/me endpoint with PUT
        ...profileData,
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth : null,
      });

      // If successful, redirect to the main profile page
      router.push('/profile');
    } catch (err: any) {
      setFetchError(err.message || 'An unexpected error occurred during profile update.');
    } finally {
      setIsSubmitting(false); // Submission process complete
    }
  };

  // --- Conditional Rendering: Loading, Error, or Form ---
  if (authLoading || fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading profile...</span>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-red-500">
        Authentication Error: {authError}
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-red-500 flex-col p-4">
        <p className="text-lg mb-4">Error: {fetchError}</p>
        <button onClick={() => setFetchError(null)} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Dismiss Error
        </button>
      </div>
    );
  }

  // --- Main Render Function: Display Profile Completion Form ---
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Profile
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Please provide a few more details to complete your profile.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={profileData.firstName || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={profileData.lastName || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                id="dateOfBirth"
                value={profileData.dateOfBirth || ''}
                onChange={handleDateChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={profileData.phoneNumber || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {/* Address Line 1 */}
            <div className="md:col-span-2">
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                id="addressLine1"
                value={profileData.addressLine1 || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {/* Address Line 2 */}
            <div className="md:col-span-2">
              <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">Address Line 2</label>
              <input
                type="text"
                name="addressLine2"
                id="addressLine2"
                value={profileData.addressLine2 || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                id="city"
                value={profileData.city || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {/* State/Province */}
            <div>
              <label htmlFor="stateProvince" className="block text-sm font-medium text-gray-700">State/Province</label>
              <input
                type="text"
                name="stateProvince"
                id="stateProvince"
                value={profileData.stateProvince || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {/* Zip Code */}
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                id="zipCode"
                value={profileData.zipCode || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                name="country"
                id="country"
                value={profileData.country || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {/* Bio */}
            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                name="bio"
                id="bio"
                rows={3}
                value={profileData.bio || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              ></textarea>
            </div>
            {/* Headline */}
            <div className="md:col-span-2">
              <label htmlFor="headline" className="block text-sm font-medium text-gray-700">Headline</label>
              <input
                type="text"
                name="headline"
                id="headline"
                value={profileData.headline || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {/* Profile Picture URL */}
            {/* <div className="md:col-span-2">
              <label htmlFor="profilePictureUrl" className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
              <input
                type="url"
                name="profilePictureUrl"
                id="profilePictureUrl"
                value={profileData.profilePictureUrl || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div> */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Profile Picture
              </label>

              <div className="flex items-center space-x-4">
                <img
                  src={getProfileImageUrl(profileData.profilePictureUrl)}
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
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Profile...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
