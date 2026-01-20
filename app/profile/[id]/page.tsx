'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserProfileHeader from '@/components/UserProfile/UserProfileHeader'; // Component for the left profile card
import UserProfileSection from '@/components/UserProfile/UserProfileSection'; // Generic section wrapper

// Individual sections for profile data. These components will consume the arrays from userProfile.
import ExperienceSection from '@/components/UserProfile/ExperienceSection';
import SkillsSection from '@/components/UserProfile/SkillsSection';
import EducationSection from '@/components/UserProfile/EducationSection';
import ExamAttemptsSection from '@/components/UserProfile/ExamAttemptsSection';
import CoachingSection from '@/components/UserProfile/CoachingSection';
import PublicationsSection from '@/components/UserProfile/PublicationsSection';
import ProjectsSection from '@/components/UserProfile/ProjectsSection';
import CommunityGroupsSection from '@/components/UserProfile/CommunityGroupsSection';

// Modals/Forms for editing profile data
import EditProfileModal from '@/components/UserProfile/EditProfileModal';

import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { useAuth } from '@/context/AuthContext'; 
import { getProfileImageUrl } from '@/lib/helpers/profileImage';

const OthersProfilePage: React.FC = () => {
  const params = useParams();
  const userId = params.id as string;

  // We fetch the specific user profile. Note: we do NOT use withAuthRequired here 
  // so that profiles can be viewed, but useAuth still provides the current viewer's info.
  const { user: authUser } = useAuth();
  const { userProfile, isLoading: isProfileLoading, isError: profileError } = useUserProfile(userId);

  if (isProfileLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading profile...</span>
        </div>
      </AppLayout>
    );
  }

  if (profileError || !userProfile) {
    return (
      <AppLayout>
        <div className="text-center py-8 text-gray-700">
          <p>Profile not found or an error occurred.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#EEF0F4] py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <div className="flex flex-col items-center">
                  <img
                    src={getProfileImageUrl(userProfile.profilePictureUrl)}
                    alt={userProfile.firstName || "Profile"}
                    className="w-28 h-28 rounded-full object-cover object-top mb-4"
                  />
                  <h1 className="text-2xl font-bold text-center">
                    {userProfile.firstName} {userProfile.lastName}
                  </h1>
                  <p className="text-gray-600 text-sm text-center mb-4">{userProfile.headline || "N/A"}</p>

                  <div className="w-full mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current Organization</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3.5 rounded-lg">N/A</p>
                  </div>

                  <div className="w-full mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">About Me</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{userProfile.bio || "No description available."}</p>
                  </div>

                  <div className="w-full mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-8 text-gray-400"><i className="fas fa-map-marker-alt"></i></div>
                        <div className="flex-1"><p className="text-sm text-gray-600">Location: {userProfile.city || "N/A"}, {userProfile.country || "N/A"}</p></div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full mb-7">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-8 text-gray-400"><i className="fas fa-envelope"></i></div>
                        <div className="flex-1"><p className="text-sm text-gray-600">{userProfile.email || "N/A"}</p></div>
                      </div>
                    </div>
                  </div>

                  {/* Redundant structure: Only "Share" and "Connect" buttons, no Edit */}
                  <div className="flex w-full space-x-3">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition shadow-md">
                      <i className="fas fa-user-plus mr-2"></i> Connect
                    </button>
                    <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition">
                      <i className="fas fa-share-alt mr-2"></i> Share
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Information Cards */}
            <div className="lg:w-[60%]">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{userProfile.firstName}'s Profile</h2>
                <p className="text-gray-600 mt-1">View professional background and qualifications</p>
              </div>

              {/* Explicitly passing canEdit={false} to ensure no edit buttons appear */}
              <ExperienceSection experiences={userProfile.experiences || []} canEdit={false} />
              <SkillsSection skills={userProfile.skills || []} canEdit={false} />
              <EducationSection education={userProfile.education || []} canEdit={false} />
              <ExamAttemptsSection examAttempts={userProfile.examAttempts || []} canEdit={false} />
              <CoachingSection coaching={userProfile.coaching || []} canEdit={false} />
              <PublicationsSection publications={userProfile.publications || []} canEdit={false} />
              <ProjectsSection projects={userProfile.projects || []} canEdit={false} />
              <CommunityGroupsSection communityGroups={userProfile.communityGroups || []} canEdit={false} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default OthersProfilePage;