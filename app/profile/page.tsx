// app/profile/page.tsx
'use client'; // This component uses React hooks and needs client-side interactivity

import React, { useMemo, useState } from 'react';
import AppLayout from '../../components/AppLayout'; // Our main application layout
import { useUserProfile } from '../../hooks/useUserProfile'; // Our custom hook to fetch user profile data
import UserProfileHeader from '../../components/UserProfile/UserProfileHeader'; // Component for the left profile card
import UserProfileSection from '../../components/UserProfile/UserProfileSection'; // Generic section wrapper

// Individual sections for profile data. These components will consume the arrays from userProfile.
import ExperienceSection from '../../components/UserProfile/ExperienceSection';
import SkillsSection from '../../components/UserProfile/SkillsSection';
import EducationSection from '../../components/UserProfile/EducationSection';
import ExamAttemptsSection from '../../components/UserProfile/ExamAttemptsSection';
import CoachingSection from '../../components/UserProfile/CoachingSection';
import PublicationsSection from '../../components/UserProfile/PublicationsSection';
import ProjectsSection from '../../components/UserProfile/ProjectsSection';
import CommunityGroupsSection from '../../components/UserProfile/CommunityGroupsSection';

// Modals/Forms for editing profile data
import EditProfileModal from '../../components/UserProfile/EditProfileModal';
import ChangePasswordModal from '../../components/UserProfile/ChangePasswordModal';

import LoadingSpinner from '../../components/UI/LoadingSpinner'; // Our loading spinner component
import { format } from 'date-fns'; // For date formatting from backend ISO strings

import { useAuth, withAuthRequired } from '../../context/AuthContext'; // Authentication context and HOC
import TopBar from '@/components/TopBar';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';
import { AlertModal } from '@/components/AlertModal';
import { toast } from 'react-hot-toast';
import ShareLinkModal from '@/components/UI/ShareLinkModal';

const ProfilePage: React.FC = () => {
  // Get authentication status and profile data from our custom hooks
  const { user: authUser, isLoading: isAuthLoading, error: authError, refetchProfile } = useAuth();
  const { userProfile, isLoading: isProfileLoading, isError: profileError } = useUserProfile();
  const API_BASE = process.env.NEXT_PUBLIC_DOTNET_BACKEND_BASE || "http://localhost:3000/api";

  // State for controlling the main profile edit modal's visibility
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordToast, setPasswordToast] = useState<string | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const shareUrl = useMemo(() => {
    // Share the public profile route, not the editable /profile page
    return typeof window !== 'undefined' && userProfile?.id
      ? `${window.location.origin}/profile/${userProfile.id}`
      : '';
  }, [userProfile?.id]);

  // Consolidated loading and error states for the entire page
  const isLoading = isAuthLoading || isProfileLoading;
  const error = authError || profileError;

  // Debugging logs - will show the data flowing into this component
  console.log("ProfilePage: Auth User Data (from useAuth): ", authUser);
  console.log("ProfilePage: User Profile Data (from useUserProfile): ", userProfile);

  // --- Handle Loading State ---
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading profile data...</span>
        </div>
      </AppLayout>
    );
  }

  // --- Handle Error State ---
  if (error) {
    console.error("Error loading user profile:", error);
    return (
      <AppLayout>
        <div className="text-red-600 text-center py-8">
          <p>Error loading your profile: {error || "An unexpected error occurred."}</p>
          <p className="mt-4 text-gray-700">Please try refreshing the page or contact support.</p>
        </div>
      </AppLayout>
    );
  }

  // --- Handle No Profile Data (e.g., if user is authenticated but profile couldn't be retrieved/provisioned) ---
  if (!userProfile) {
    return (
      <AppLayout>
        <div className="text-center py-8 text-gray-700">
          <p>No user profile data available for your account after authentication.</p>
          <p className="mt-4">Please ensure your account is properly set up or contact support.</p>
        </div>
      </AppLayout>
    );
  }

  // --- Main Render Function: Display Dynamic Profile Data ---
  return (
    <AppLayout>
      {/* <TopBar /> */}
      <div className="min-h-screen bg-[#EEF0F4] py-8"> {/* Adjusted outer container for dynamic data */}
        {/*
          The pt-[61px] and min-h-[calc(100vh-72px)] were likely to account for a fixed TopBar
          We're now using AppLayout which has a Navbar. So these might need adjustment based on Navbar height.
        */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <div className="flex flex-col items-center">
                  <img
                    src={getProfileImageUrl(userProfile.profilePictureUrl)} // Dynamic photo
                    alt={userProfile.firstName || userProfile.username || "Profile"} // Dynamic alt text
                    className="w-28 h-28 rounded-full object-cover object-top mb-4"
                  />
                  <h1 className="text-2xl font-bold text-center">
                    {userProfile.firstName} {userProfile.lastName}
                  </h1>
                  <p className="text-gray-600 text-sm text-center mb-4">{userProfile.headline || "N/A"}</p> {/* Dynamic designation */}

                  {/* Current Organization - Not directly in DTO, placeholder */}
                  <div className="w-full mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current Organization</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3.5 rounded-lg">N/A</p>
                  </div>

                  {/* About Me - Dynamic */}
                  <div className="w-full mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">About Me</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{userProfile.bio || "No description available."}</p>
                  </div>

                  {/* Basic Information - Mostly N/A as fields not in DTO */}
                  <div className="w-full mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-8 text-gray-400"><i className="fas fa-user-clock"></i></div>
                        <div className="flex-1"><p className="text-sm text-gray-600">Age: N/A</p></div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 text-gray-400"><i className="fas fa-map-marker-alt"></i></div>
                        <div className="flex-1"><p className="text-sm text-gray-600">Location: {userProfile.city || "N/A"}, {userProfile.country || "N/A"}</p></div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 text-gray-400"><i className="fas fa-language"></i></div>
                        <div className="flex-1"><p className="text-sm text-gray-600">Languages: N/A</p></div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details - Dynamic */}
                  <div className="w-full mb-7">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-8 text-gray-400"><i className="fas fa-envelope"></i></div>
                        <div className="flex-1"><p className="text-sm text-gray-600">{userProfile.email || "N/A"}</p></div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 text-gray-400"><i className="fas fa-phone-alt"></i></div>
                        <div className="flex-1"><p className="text-sm text-gray-600">{userProfile.phoneNumber || "N/A"}</p></div>
                      </div>
                      {/* LinkedIn and Twitter not in DTO, placeholder */}
                      <div className="flex items-start">
                        <div className="w-8 text-gray-400"><i className="fab fa-linkedin"></i></div>
                        <div className="flex-1"><p className="text-sm text-gray-600">LinkedIn: N/A</p></div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 text-gray-400"><i className="fab fa-twitter"></i></div>
                        <div className="flex-1"><p className="text-sm text-gray-600">Twitter: N/A</p></div>
                      </div>
                    </div>
                  </div>

                  {/* Edit Profile Button - Dynamic Action */}
                  <div className="w-full space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <i className="fas fa-edit"></i>
                        <span className="whitespace-nowrap">Edit Profile</span>
                      </button>

                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                        onClick={() => {
                          if (!shareUrl) {
                            toast.error('Profile link is not available yet');
                            return;
                          }
                          setIsShareModalOpen(true);
                        }}
                      >
                        <i className="fas fa-share-alt"></i>
                        <span className="whitespace-nowrap">Share</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsChangePasswordOpen(true)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <i className="fas fa-key"></i>
                      <span className="whitespace-nowrap">Change Password</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Information Cards */}
            <div className="lg:w-[60%]">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                <p className="text-gray-600 mt-1">Manage your profile information and track your progress</p>
              </div>

              {/* Target Exams Card (using ExperienceSection component for dynamic data) */}
              <ExperienceSection experiences={userProfile.experiences || []} />

              {/* Skills Card (using SkillsSection component for dynamic data) */}
              <SkillsSection skills={userProfile.skills || []} />

              {/* Education Card (using EducationSection component for dynamic data) */}
              <EducationSection education={userProfile.education || []} />

              {/* Exam Attempts Card (using ExamAttemptsSection component for dynamic data) */}
              <ExamAttemptsSection examAttempts={userProfile.examAttempts || []} />

              {/* Coaching Card (using CoachingSection component for dynamic data) */}
              <CoachingSection coaching={userProfile.coaching || []} />

              {/* Publications Card (using PublicationsSection component for dynamic data) */}
              <PublicationsSection publications={userProfile.publications || []} />

              {/* Projects Card (using ProjectsSection component for dynamic data) */}
              <ProjectsSection projects={userProfile.projects || []} />

              {/* Community Groups Card (using CommunityGroupsSection component for dynamic data) */}
              <CommunityGroupsSection communityGroups={userProfile.communityGroups || []} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Edit Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          userProfile={userProfile}
          onSuccess={() => refetchProfile()}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {isChangePasswordOpen && (
        <ChangePasswordModal
          onClose={() => setIsChangePasswordOpen(false)}
          onSuccess={() => setPasswordToast('Password updated successfully.')}
        />
      )}

      {passwordToast && (
        <AlertModal
          message={passwordToast}
          type="success"
          onClose={() => setPasswordToast(null)}
        />
      )}

      <ShareLinkModal
        open={isShareModalOpen}
        url={shareUrl}
        title="Share your profile"
        onClose={() => setIsShareModalOpen(false)}
      />
    </AppLayout>
  );
};

// Protect this page with our custom HOC
export default withAuthRequired(ProfilePage);