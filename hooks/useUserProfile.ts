// hooks/useUserProfile.ts
import { apiFetch, get, postApi, put, remove } from '../lib/api'; // Use new apiFetch
import { useAuth } from '../context/AuthContext'; // Import our new AuthContext

// Import types from the single 'user' types folder
import {
  UserProfile,
  UpdateUserProfileDto,
  UserExperience, UpdateUserExperienceDto,
  UserSkill, UpdateUserSkillDto,
  UserEducation, UpdateUserEducationDto,
  UserExamAttempt, UpdateUserExamAttemptDto,
  UserCoaching, UpdateUserCoachingDto,
  UserPublication, UpdateUserPublicationDto,
  UserProject, UpdateUserProjectDto,
  UserCommunityGroup, UpdateUserCommunityGroupDto
} from '../lib/types/user';
import { useEffect, useState } from 'react';

export function useUserProfile(targetUserId?: string) {
  const { user: authUser, userProfile: myProfile, isProfileLoading: isAuthProfileLoading, isProfileError: isError, refetchProfile } = useAuth();

  const PROFILE_BASE = '/Users/profile';

  const [externalProfile, setExternalProfile] = useState<UserProfile | null>(null);
  const [isExternalLoading, setIsExternalLoading] = useState(false);
  const [externalError, setExternalError] = useState<any>(null);

  const isOwnProfile = !targetUserId || targetUserId === 'me' || (authUser?.id !== undefined && targetUserId === authUser.id);

  const isProfileSetup = !!myProfile;

  useEffect(() => {
    // Only fetch if it's NOT our own profile and we have a target ID
    if (!isOwnProfile && targetUserId) {
      const fetchExternalProfile = async () => {
        setIsExternalLoading(true);
        try {
          // Fetch specific user by ID
          const data = await get<UserProfile>(`${PROFILE_BASE}/${targetUserId}`);
          setExternalProfile(data);
        } catch (err) {
          setExternalError(err);
        } finally {
          setIsExternalLoading(false);
        }
      };
      fetchExternalProfile();
    }
  }, [targetUserId, isOwnProfile]);

  const profileToDisplay = isOwnProfile ? myProfile : externalProfile;
  const isLoading = isOwnProfile ? isAuthProfileLoading : isExternalLoading;
  const error = isOwnProfile ? null : externalError;

  // --- Core Profile Actions ---
  const updateProfile = async (updateDto: UpdateUserProfileDto) => {
    // Don't hard-block on `authUser` being unset; apiFetch adds the Bearer token
    // from localStorage when present, and the backend will 401 if not authenticated.
    try {
      const updatedData = await put<UserProfile>(PROFILE_BASE, updateDto); 
      // NOTE: We don't need to optimistically update or revalidate here, we just need to refetch
      // the source of truth from the AuthContext to get the new state.
      await refetchProfile(); 
      return updatedData;
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      throw err;
    }
  };

  // --- Generic CRUD for Nested Collections ---
  const addItem = async <T, U>(url: string, dto: U): Promise<T> => {
    if (!authUser?.id) throw new Error("User not authenticated for adding item.");
    try {
      const newItem = await postApi<T>(url, dto);
      await refetchProfile(); // CRITICAL: Re-fetch the entire profile after any change
      return newItem;
    } catch (err: any) {
      console.error(`Failed to add item to ${url}:`, err);
      throw err;
    }
  };

  const updateItem = async <T, U>(url: string, id: number, dto: U): Promise<void> => {
    if (!authUser?.id) throw new Error("User not authenticated for updating item.");
    try {
      await put<T>(`${url}/${id}`, dto);
      await refetchProfile(); // CRITICAL: Re-fetch the entire profile after any change
    } catch (err: any) {
      console.error(`Failed to update item ${id} in ${url}:`, err);
      throw err;
    }
  };

  const deleteItem = async (url: string, id: number): Promise<void> => {
    if (!authUser?.id) throw new Error("User not authenticated for deleting item.");
    try {
      await remove(`${url}/${id}`);
      await refetchProfile(); // CRITICAL: Re-fetch the entire profile after any change
    } catch (err: any) {
      console.error(`Failed to delete item ${id} from ${url}:`, err);
      throw err;
    }
  };

  // --- Specific CRUD operations for each nested collection ---

  // Experiences
  const addExperience = (dto: UpdateUserExperienceDto) => addItem<UserExperience, UpdateUserExperienceDto>(`${PROFILE_BASE}/experiences`, dto);
  const updateExperience = (id: number, dto: UpdateUserExperienceDto) => updateItem<UserExperience, UpdateUserExperienceDto>(`${PROFILE_BASE}/experiences`, id, dto);
  const deleteExperience = (id: number) => deleteItem(`${PROFILE_BASE}/experiences`, id);

  // Skills
  const addSkill = (dto: UpdateUserSkillDto) => addItem<UserSkill, UpdateUserSkillDto>(`${PROFILE_BASE}/skills`, dto);
  const updateSkill = (id: number, dto: UpdateUserSkillDto) => updateItem<UserSkill, UpdateUserSkillDto>(`${PROFILE_BASE}/skills`, id, dto);
  const deleteSkill = (id: number) => deleteItem(`${PROFILE_BASE}/skills`, id);

  // Education
  const addEducation = (dto: UpdateUserEducationDto) => addItem<UserEducation, UpdateUserEducationDto>(`${PROFILE_BASE}/education`, dto);
  const updateEducation = (id: number, dto: UpdateUserEducationDto) => updateItem<UserEducation, UpdateUserEducationDto>(`${PROFILE_BASE}/education`, id, dto);
  const deleteEducation = (id: number) => deleteItem(`${PROFILE_BASE}/education`, id);

  // Exam Attempts
  const addExamAttempt = (dto: UpdateUserExamAttemptDto) => addItem<UserExamAttempt, UpdateUserExamAttemptDto>(`${PROFILE_BASE}/examattempts`, dto);
  const updateExamAttempt = (id: number, dto: UpdateUserExamAttemptDto) => updateItem<UserExamAttempt, UpdateUserExamAttemptDto>(`${PROFILE_BASE}/examattempts`, id, dto);
  const deleteExamAttempt = (id: number) => deleteItem(`${PROFILE_BASE}/examattempts`, id);

  // Coaching
  const addCoaching = (dto: UpdateUserCoachingDto) => addItem<UserCoaching, UpdateUserCoachingDto>(`${PROFILE_BASE}/coaching`, dto);
  const updateCoaching = (id: number, dto: UpdateUserCoachingDto) => updateItem<UserCoaching, UpdateUserCoachingDto>(`${PROFILE_BASE}/coaching`, id, dto);
  const deleteCoaching = (id: number) => deleteItem(`${PROFILE_BASE}/coaching`, id);

  // Publications
  const addPublication = (dto: UpdateUserPublicationDto) => addItem<UserPublication, UpdateUserPublicationDto>(`${PROFILE_BASE}/publications`, dto);
  const updatePublication = (id: number, dto: UpdateUserPublicationDto) => updateItem<UserPublication, UpdateUserPublicationDto>(`${PROFILE_BASE}/publications`, id, dto);
  const deletePublication = (id: number) => deleteItem(`${PROFILE_BASE}/publications`, id);

  // Projects
  const addProject = (dto: UpdateUserProjectDto) => addItem<UserProject, UpdateUserProjectDto>(`${PROFILE_BASE}/projects`, dto);
  const updateProject = (id: number, dto: UpdateUserProjectDto) => updateItem<UserProject, UpdateUserProjectDto>(`${PROFILE_BASE}/projects`, id, dto);
  const deleteProject = (id: number) => deleteItem(`${PROFILE_BASE}/projects`, id);

  // Community Groups
  const addCommunityGroup = (dto: UpdateUserCommunityGroupDto) => addItem<UserCommunityGroup, UpdateUserCommunityGroupDto>(`${PROFILE_BASE}/communitygroups`, dto);
  const updateCommunityGroup = (id: number, dto: UpdateUserCommunityGroupDto) => updateItem<UserCommunityGroup, UpdateUserCommunityGroupDto>(`${PROFILE_BASE}/communitygroups`, id, dto);
  const deleteCommunityGroup = (id: number) => deleteItem(`${PROFILE_BASE}/communitygroups`, id);

  return {
    userProfile: profileToDisplay,
    isLoading,
    isError,
    isOwnProfile,
    updateProfile: async (dto: UpdateUserProfileDto) => {
      if (!isOwnProfile) throw new Error("Cannot edit someone else's profile");
      return updateProfile(dto);
    },
    isProfileSetup,
    addExperience, updateExperience, deleteExperience,
    addSkill, updateSkill, deleteSkill,
    addEducation, updateEducation, deleteEducation,
    addExamAttempt, updateExamAttempt, deleteExamAttempt,
    addCoaching, updateCoaching, deleteCoaching,
    addPublication, updatePublication, deletePublication,
    addProject, updateProject, deleteProject,
    addCommunityGroup, updateCommunityGroup, deleteCommunityGroup,
  };
}