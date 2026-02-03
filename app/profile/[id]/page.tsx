'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
import { useConnections } from '@/hooks/useConnections';
import { toast } from 'react-hot-toast';
import ShareLinkModal from '@/components/UI/ShareLinkModal';

const OthersProfilePage: React.FC = () => {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();

  // We fetch the specific user profile. Note: we do NOT use withAuthRequired here 
  // so that profiles can be viewed, but useAuth still provides the current viewer's info.
  const { user: authUser } = useAuth();
  const { userProfile, isLoading: isProfileLoading, isError: profileError } = useUserProfile(userId);

  // The route param might not always be the canonical user Guid.
  // Use the loaded profile id when available to match connection request ids.
  const targetUserId = userProfile?.id || userId;
  const normalizeId = (value?: string | null) => (value || '').toLowerCase();

  // Connection state/actions (reused from Circle logic)
  const {
    connections,
    pendingRequests,
    pendingIncomingRequests,
    pendingOutgoingRequests,
    sendRequest,
    acceptRequest,
    declineRequest,
    isLoading: isConnectionsLoading,
  } = useConnections({ includeOutgoingPending: true });

  const isOwnProfile = !!authUser?.id && authUser.id === targetUserId;

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const shareUrl = useMemo(() => {
    return typeof window !== 'undefined' && targetUserId
      ? `${window.location.origin}/profile/${targetUserId}`
      : '';
  }, [targetUserId]);

  const connectionToUser = useMemo(() => {
    const target = normalizeId(targetUserId);
    return connections.find(
      (c) => normalizeId(c.connectedUserId) === target || normalizeId(c.connectedUser?.id) === target
    );
  }, [connections, targetUserId]);

  const isConnected = !!connectionToUser;

  const outgoingRequest = useMemo(() => {
    if (!authUser?.id) return null;
    const me = normalizeId(authUser.id);
    const target = normalizeId(targetUserId);
    return (
      pendingOutgoingRequests.find(
        (r) => r.status === 'Pending' && normalizeId(r.senderId) === me && normalizeId(r.receiverId) === target
      ) || null
    );
  }, [pendingOutgoingRequests, authUser?.id, targetUserId]);

  const incomingRequest = useMemo(() => {
    if (!authUser?.id) return null;
    const me = normalizeId(authUser.id);
    const target = normalizeId(targetUserId);
    return (
      (pendingIncomingRequests.length ? pendingIncomingRequests : pendingRequests).find(
        (r) => r.status === 'Pending' && normalizeId(r.receiverId) === me && normalizeId(r.senderId) === target
      ) || null
    );
  }, [pendingRequests, pendingIncomingRequests, authUser?.id, targetUserId]);

  // Dev-only diagnostics (remove once verified)
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    const me = normalizeId(authUser?.id);
    const target = normalizeId(targetUserId);

    const outgoingMatch = pendingOutgoingRequests.find(
      (r) => r.status === 'Pending' && normalizeId(r.senderId) === me && normalizeId(r.receiverId) === target
    );
    const incomingMatch = pendingRequests.find(
      (r) => r.status === 'Pending' && normalizeId(r.receiverId) === me && normalizeId(r.senderId) === target
    );

    console.log('[Profile Connect Debug]', {
      routeParam: userId,
      userProfileId: userProfile?.id,
      targetUserId,
      authUserId: authUser?.id,
      pendingRequestsCount: pendingRequests.length,
      pendingIncomingRequestsCount: pendingIncomingRequests?.length,
      pendingOutgoingRequestsCount: pendingOutgoingRequests?.length,
      connectionsCount: connections.length,
      outgoingMatch,
      incomingMatch,
      pendingSample: pendingRequests.slice(0, 10).map((r) => ({
        id: r.id,
        status: r.status,
        senderId: r.senderId,
        receiverId: r.receiverId,
      })),
    });
  }, [
    authUser?.id,
    connections.length,
    pendingRequests,
    pendingIncomingRequests,
    pendingOutgoingRequests,
    targetUserId,
    userId,
    userProfile?.id,
  ]);

  const handlePrimaryAction = async () => {
    if (!authUser?.id) {
      // Preserve the exact current path in case the param isn't a Guid.
      const returnTo = typeof window !== 'undefined' ? window.location.pathname + window.location.search : `/profile/${userId}`;
      router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    if (isConnected) {
      router.push(`/messaging?userId=${targetUserId}`);
      return;
    }

    if (incomingRequest) {
      await acceptRequest(incomingRequest.id);
      return;
    }

    if (outgoingRequest) {
      return;
    }

    await sendRequest(targetUserId);
  };

  const handleDeclineIncoming = async () => {
    if (!incomingRequest) return;
    await declineRequest(incomingRequest.id);
  };

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
      <div className="min-h-screen bg-[#EEF0F4] pb-8 pt-[80px] lg:pt-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-4">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
            >
              <span aria-hidden>←</span>
              <span>Back Home</span>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-sm p-6 lg:sticky lg:top-24">
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
                  {!isOwnProfile ? (
                    <div className="w-full space-y-3">
                      <div className="flex w-full space-x-3">
                        {incomingRequest ? (
                          <button
                            disabled={isConnectionsLoading}
                            onClick={handlePrimaryAction}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg font-medium transition shadow-md"
                          >
                            <i className="fas fa-user-check mr-2"></i> Accept
                          </button>
                        ) : (
                          <button
                            disabled={isConnectionsLoading || !!outgoingRequest}
                            onClick={handlePrimaryAction}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition shadow-md ${
                              isConnected
                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-none'
                                : outgoingRequest
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed shadow-none'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            <i className={`fas ${isConnected ? 'fa-comment-dots' : 'fa-user-plus'} mr-2`}></i>
                            {isConnected ? 'Message' : outgoingRequest ? 'Request Pending' : 'Connect'}
                          </button>
                        )}

                        <button
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition"
                          onClick={() => {
                            if (!shareUrl) {
                              toast.error('Profile link is not available yet');
                              return;
                            }
                            setIsShareModalOpen(true);
                          }}
                        >
                          <i className="fas fa-share-alt mr-2"></i> Share
                        </button>
                      </div>

                      {incomingRequest && (
                        <button
                          disabled={isConnectionsLoading}
                          onClick={handleDeclineIncoming}
                          className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium transition"
                        >
                          Ignore request
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex w-full">
                      <button
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition"
                        onClick={() => {
                          if (!shareUrl) {
                            toast.error('Profile link is not available yet');
                            return;
                          }
                          setIsShareModalOpen(true);
                        }}
                      >
                        <i className="fas fa-share-alt mr-2"></i> Share
                      </button>
                    </div>
                  )}
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

      <ShareLinkModal
        open={isShareModalOpen}
        url={shareUrl}
        title="Share profile"
        onClose={() => setIsShareModalOpen(false)}
      />
    </AppLayout>
  );
};

export default OthersProfilePage;