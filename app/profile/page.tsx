// app/profile/page.tsx
'use client'; // This component uses React hooks and needs client-side interactivity

import React, { useMemo, useState, useEffect } from 'react';
import { Briefcase, User, Mail, Phone, MapPin, Calendar, Edit2, Key, Share2 } from 'lucide-react';
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
import { calculateAge } from '@/lib/dates';

// Modals/Forms for editing profile data
import EditProfileModal from '../../components/UserProfile/EditProfileModal';
import ChangePasswordModal from '../../components/UserProfile/ChangePasswordModal';

import LoadingSpinner from '../../components/UI/LoadingSpinner'; // Our loading spinner component
import { format } from 'date-fns'; // For date formatting from backend ISO strings

import { useAuth, withAuthRequired } from '../../context/AuthContext'; // Authentication context and HOC
import { getProfileImageUrl } from '@/lib/helpers/profileImage';
import { AlertModal } from '@/components/AlertModal';
import { toast } from 'react-hot-toast';
import ShareLinkModal from '@/components/UI/ShareLinkModal';
import Link from 'next/link';

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

  // Local state for each profile section to enable real-time updates
  const [experiences, setExperiences] = useState(userProfile?.experiences || []);
  const [skills, setSkills] = useState(userProfile?.skills || []);
  const [education, setEducation] = useState(userProfile?.education || []);
  const [examAttempts, setExamAttempts] = useState(userProfile?.examAttempts || []);
  const [coaching, setCoaching] = useState(userProfile?.coaching || []);
  const [publications, setPublications] = useState(userProfile?.publications || []);
  const [projects, setProjects] = useState(userProfile?.projects || []);
  const [communityGroups, setCommunityGroups] = useState(userProfile?.communityGroups || []);

  // Update local state when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setExperiences(userProfile.experiences || []);
      setSkills(userProfile.skills || []);
      setEducation(userProfile.education || []);
      setExamAttempts(userProfile.examAttempts || []);
      setCoaching(userProfile.coaching || []);
      setPublications(userProfile.publications || []);
      setProjects(userProfile.projects || []);
      setCommunityGroups(userProfile.communityGroups || []);
    }
  }, [userProfile]);

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
  // Override AppLayout default styles to ensure full-width background
  const profileMainClassName = 'flex-1 overflow-y-auto bg-[#EEF0F4]';

  return (
    <AppLayout mainClassName={profileMainClassName}>
      {/* 
         Adjusted padding to account for fixed TopBar (~61px). 
         On desktop, we need more padding since we removed the default lg:mt-16 from AppLayout.
         Previously: 64px (margin) + 32px (padding) = 96px total top space.
      */}
      <div className="min-h-screen pb-8 pt-[80px] lg:pt-[96px]">
        {/*
          The pt-[61px] and min-h-[calc(100vh-72px)] were likely to account for a fixed TopBar
          We're now using AppLayout which has a Navbar. So these might need adjustment based on Navbar height.
        */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-4">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
            >
              <span aria-hidden>←</span>
              <span>Back</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 justify-center">
            {/* Left Column - Profile Card */}
            <div className="lg:w-[360px] lg:shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:mt-2 lg:sticky lg:top-24">
                <div className="flex flex-col items-center">
                  <img
                    src={getProfileImageUrl(userProfile.profilePictureUrl)} // Dynamic photo
                    alt={userProfile.firstName || userProfile.username || "Profile"} // Dynamic alt text
                    className="w-28 h-28 rounded-full object-cover object-top mb-4"
                  />
                  <h1 className="text-xl sm:text-[22px] font-extrabold text-gray-900 text-center">
                    {/* Dynamic name */}
                    {userProfile.firstName || userProfile.username || "N/A"} {userProfile.lastName || ""}
                  </h1>
                  <p className="text-[#505965] text-xs sm:text-sm mt-1">{userProfile.headline || ""}</p> {/* Dynamic designation */}

                  <div className="w-full mb-6">
                    <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Briefcase size={16} className="text-[#0096c7]" />
                      Current Organization
                    </h3>
                    <p className="text-[12.5px] sm:text-[13px] font-medium text-gray-700 bg-gray-50 border border-gray-100 p-3 rounded-xl">{(userProfile as any).currentOrganization || "N/A"}</p>
                  </div>

                  <div className="w-full mb-6">
                    <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <User size={16} className="text-[#0096c7]" />
                      About Me
                    </h3>
                    <p className="text-[12.5px] sm:text-[13px] text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 p-3 rounded-xl">{userProfile.bio || "No description available."}</p>
                  </div>

                  <div className="w-full mb-6">
                    <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar size={16} className="text-[#0096c7]" />
                      Basic Information
                    </h3>
                    <div className="space-y-3 bg-gray-50 border border-gray-100 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                          <Calendar size={14} className="text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Age</p>
                          <p className="text-[13px] font-medium text-gray-700 mt-0.5">
                            {calculateAge(userProfile.dateOfBirth) ? `${calculateAge(userProfile.dateOfBirth)} years` : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                          <MapPin size={14} className="text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Location</p>
                          <p className="text-[13px] font-medium text-gray-700 mt-0.5">
                            {[userProfile.city, userProfile.stateProvince, userProfile.country].filter(Boolean).join(', ') || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full mb-7">
                    <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Mail size={16} className="text-[#0096c7]" />
                      Contact Details
                    </h3>
                    <div className="space-y-3 bg-gray-50 border border-gray-100 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                          <Mail size={14} className="text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email</p>
                          <p className="text-[13px] font-medium text-gray-700 mt-0.5 truncate">{userProfile.email || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                          <Phone size={14} className="text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phone</p>
                          <p className="text-[13px] font-medium text-gray-700 mt-0.5 truncate">{userProfile.phoneNumber || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edit Profile Button - Dynamic Action */}
                  <div className="w-full space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0096c7] px-4 py-3 text-[13px] font-bold text-white shadow-sm transition hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                      >
                        <Edit2 size={16} />
                        <span className="whitespace-nowrap">Edit Profile</span>
                      </button>

                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-[13px] font-bold text-gray-700 shadow-sm transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                        onClick={() => {
                          if (!shareUrl) {
                            toast.error('Profile link is not available yet');
                            return;
                          }
                          setIsShareModalOpen(true);
                        }}
                      >
                        <Share2 size={16} />
                        <span className="whitespace-nowrap">Share</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsChangePasswordOpen(true)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[13px] font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                    >
                      <Key size={16} />
                      <span className="whitespace-nowrap">Change Password</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Information Cards */}
            <div className="flex-1 min-w-0">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#0096c7] tracking-tight">My Profile</h2>
                <p className="text-[14px] sm:text-base text-gray-500 mt-1 font-medium">Manage your profile information and track your progress</p>
              </div>

              {/* Target Exams Card (using ExperienceSection component for dynamic data) */}
              <ExperienceSection experiences={experiences} onExperiencesChange={setExperiences} />

              {/* Skills Card (using SkillsSection component for dynamic data) */}
              <SkillsSection skills={skills} onSkillsChange={setSkills} />

              {/* Education Card (using EducationSection component for dynamic data) */}
              <EducationSection education={education} onEducationChange={setEducation} />

              {/* Exam Attempts Card (using ExamAttemptsSection component for dynamic data) */}
              <ExamAttemptsSection examAttempts={examAttempts} onExamAttemptsChange={setExamAttempts} />

              {/* Coaching Card (using CoachingSection component for dynamic data) */}
              <CoachingSection coaching={coaching} onCoachingChange={setCoaching} />

              {/* Publications Card (using PublicationsSection component for dynamic data) */}
              <PublicationsSection publications={publications} onPublicationsChange={setPublications} />

              {/* Projects Card (using ProjectsSection component for dynamic data) */}
              <ProjectsSection projects={projects} onProjectsChange={setProjects} />

              {/* Community Groups Card (using CommunityGroupsSection component for dynamic data) */}
              <CommunityGroupsSection communityGroups={communityGroups} onCommunityGroupsChange={setCommunityGroups} />
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