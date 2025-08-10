// hooks/useUserProfile.ts
import useSWR, { mutate } from 'swr';
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

// The SWR fetcher function, now fetches 'UserProfile' type
// It takes userId as a parameter to the fetcher key
const fetchUserProfile = (url: string, userId: string | null) => {
  if (!userId) return null; // Don't fetch if no user ID
  console.log("Fetching user profile for userId:", userId);
  console.log("API URL:", url);
  return get<UserProfile>(url);
};

// A constant key for SWR cache invalidation
// Now depends on the authenticated user's ID
const getUserProfileApiRoute = (userId: string | null) => {
  const route = userId ? `/Users/profile?userId=${userId}` : null;
  console.log("SWR Key for UserProfile:", route);
  return route;
}


export function useUserProfile() {
  const { user, isLoading: isAuthLoading } = useAuth(); // Get user from our AuthContext

  // SWR key now includes the user.id
  const swrKey = getUserProfileApiRoute(user?.id || null);
  console.log(">>>> useUserProfile hook: SWR Key (before useSWR):", swrKey);

  const { data, error, isLoading: isProfileDataLoading } = useSWR(
    swrKey,
    // ([url]) => fetchUserProfile(url, user?.id || null) // Pass userId to fetcher
    // Set your breakpoint on THE LINE BELOW, inside the arrow function:
    (keyPassedToFetcher) => { // <--- Breakpoint GOES HERE
        console.log(">>>> SWR's fetcher function activated. Key it received:", keyPassedToFetcher); // <--- Make sure this log is here
        return fetchUserProfile(keyPassedToFetcher as string, user?.id || null); // Pass userId to fetcher
    }
  );

  console.log("User Data ", user);
  

  console.log("UserProfile SWR Key:", swrKey);
  console.log("UserProfile SWR Data:", data);
  console.log("UserProfile SWR Error:", error);

  // Consolidated loading state
  const isLoading = isAuthLoading || isProfileDataLoading;

  // --- Core Profile Actions ---
  const updateProfile = async (updateDto: UpdateUserProfileDto) => {
    if (!user?.id) throw new Error("User not authenticated for update.");
    try {
      const updatedData = await put<UserProfile>(`/users/profile`, updateDto); // API endpoint does not need userId in URL as it's from claims
      mutate(getUserProfileApiRoute(user.id), updatedData, false); // Optimistic update
      return updatedData;
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      throw err;
    } finally {
      mutate(getUserProfileApiRoute(user.id)); // Revalidate
    }
  };

  // --- Generic CRUD for Nested Collections ---
  const addItem = async <T, U>(url: string, dto: U): Promise<T> => {
    if (!user?.id) throw new Error("User not authenticated for adding item.");
    try {
      const newItem = await postApi<T>(url, dto);
      mutate(getUserProfileApiRoute(user.id)); // Revalidate full UserProfile after add
      return newItem;
    } catch (err: any) {
      console.error(`Failed to add item to ${url}:`, err);
      throw err;
    }
  };

  const updateItem = async <T, U>(url: string, id: number, dto: U): Promise<void> => {
    if (!user?.id) throw new Error("User not authenticated for updating item.");
    try {
      await put<T>(`${url}/${id}`, dto);
      mutate(getUserProfileApiRoute(user.id)); // Revalidate full UserProfile after update
    } catch (err: any) {
      console.error(`Failed to update item ${id} in ${url}:`, err);
      throw err;
    }
  };

  const deleteItem = async (url: string, id: number): Promise<void> => {
    if (!user?.id) throw new Error("User not authenticated for deleting item.");
    try {
      await remove(`${url}/${id}`);
      mutate(getUserProfileApiRoute(user.id)); // Revalidate full UserProfile after delete
    } catch (err: any) {
      console.error(`Failed to delete item ${id} from ${url}:`, err);
      throw err;
    }
  };

  // --- Specific CRUD operations for each nested collection ---

  // Experiences
  const addExperience = (dto: UpdateUserExperienceDto) => addItem<UserExperience, UpdateUserExperienceDto>('/users/profile/experiences', dto);
  const updateExperience = (id: number, dto: UpdateUserExperienceDto) => updateItem<UserExperience, UpdateUserExperienceDto>('/users/profile/experiences', id, dto);
  const deleteExperience = (id: number) => deleteItem('/users/profile/experiences', id);

  // Skills
  const addSkill = (dto: UpdateUserSkillDto) => addItem<UserSkill, UpdateUserSkillDto>('/users/profile/skills', dto);
  const updateSkill = (id: number, dto: UpdateUserSkillDto) => updateItem<UserSkill, UpdateUserSkillDto>('/users/profile/skills', id, dto);
  const deleteSkill = (id: number) => deleteItem('/users/profile/skills', id);

  // Education
  const addEducation = (dto: UpdateUserEducationDto) => addItem<UserEducation, UpdateUserEducationDto>('/users/profile/education', dto);
  const updateEducation = (id: number, dto: UpdateUserEducationDto) => updateItem<UserEducation, UpdateUserEducationDto>('/users/profile/education', id, dto);
  const deleteEducation = (id: number) => deleteItem('/users/profile/education', id);

  // Exam Attempts
  const addExamAttempt = (dto: UpdateUserExamAttemptDto) => addItem<UserExamAttempt, UpdateUserExamAttemptDto>('/users/profile/examattempts', dto);
  const updateExamAttempt = (id: number, dto: UpdateUserExamAttemptDto) => updateItem<UserExamAttempt, UpdateUserExamAttemptDto>('/users/profile/examattempts', id, dto);
  const deleteExamAttempt = (id: number) => deleteItem('/users/profile/examattempts', id);

  // Coaching
  const addCoaching = (dto: UpdateUserCoachingDto) => addItem<UserCoaching, UpdateUserCoachingDto>('/users/profile/coaching', dto);
  const updateCoaching = (id: number, dto: UpdateUserCoachingDto) => updateItem<UserCoaching, UpdateUserCoachingDto>('/users/profile/coaching', id, dto);
  const deleteCoaching = (id: number) => deleteItem('/users/profile/coaching', id);

  // Publications
  const addPublication = (dto: UpdateUserPublicationDto) => addItem<UserPublication, UpdateUserPublicationDto>('/users/profile/publications', dto);
  const updatePublication = (id: number, dto: UpdateUserPublicationDto) => updateItem<UserPublication, UpdateUserPublicationDto>('/users/profile/publications', id, dto);
  const deletePublication = (id: number) => deleteItem('/users/profile/publications', id);

  // Projects
  const addProject = (dto: UpdateUserProjectDto) => addItem<UserProject, UpdateUserProjectDto>('/users/profile/projects', dto);
  const updateProject = (id: number, dto: UpdateUserProjectDto) => updateItem<UserProject, UpdateUserProjectDto>('/users/profile/projects', id, dto);
  const deleteProject = (id: number) => deleteItem('/users/profile/projects', id);

  // Community Groups
  const addCommunityGroup = (dto: UpdateUserCommunityGroupDto) => addItem<UserCommunityGroup, UpdateUserCommunityGroupDto>('/users/profile/communitygroups', dto);
  const updateCommunityGroup = (id: number, dto: UpdateUserCommunityGroupDto) => updateItem<UserCommunityGroup, UpdateUserCommunityGroupDto>('/users/profile/communitygroups', id, dto);
  const deleteCommunityGroup = (id: number) => deleteItem('/users/profile/communitygroups', id);

  return {
    userProfile: data,
    isLoading,
    isError: error,
    updateProfile,
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