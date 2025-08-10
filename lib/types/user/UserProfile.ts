// lib/types/user/UserProfile.ts

// Interface for the combined user profile data returned by the API
// All nested types are defined in this file or other files within the same 'user' folder.
export interface UserProfile {
  id: string; // This is the UserProfile.Id (which is also User.Id)

  // Core user details (flattened from User entity for frontend convenience)
  username: string;
  email: string;

  // Rich Profile Fields
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  stateProvince?: string | null;
  zipCode?: string | null;
  country?: string | null;
  profilePictureUrl?: string | null;
  bio?: string | null;
  headline?: string | null;
  profileCreatedAt: string; // Renamed to avoid clash with User.createdAt
  profileUpdatedAt: string; // Renamed to avoid clash with User.updatedAt

  // Nested collections
  experiences?: UserExperience[];
  skills?: UserSkill[];
  education?: UserEducation[];
  examAttempts?: UserExamAttempt[];
  coaching?: UserCoaching[];
  publications?: UserPublication[];
  projects?: UserProject[];
  communityGroups?: UserCommunityGroup[];
}

// DTO for updating only the rich profile fields
export interface UpdateUserProfileDto {
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: Date | null;
  phoneNumber?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  stateProvince?: string | null;
  zipCode?: string | null;
  country?: string | null;
  profilePictureUrl?: string | null;
  bio?: string | null;
  headline?: string | null;
}

// --- Nested Collection Types ---
// These are defined here because they are directly consumed by UserProfile
// and reside in the same /user/ types folder.
export interface UserExperience {
  id: number;
  title?: string | null;
  organization?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}
export interface UpdateUserExperienceDto {
  title?: string | null;
  organization?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}

export interface UserSkill {
  id: number;
  skillName: string;
  level?: string | null;
}
export interface UpdateUserSkillDto {
  skillName: string;
  level?: string | null;
}

export interface UserEducation {
  id: number;
  degree: string;
  major?: string | null;
  institution: string;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}
export interface UpdateUserEducationDto {
  degree: string;
  major?: string | null;
  institution: string;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}

export interface UserExamAttempt {
  id: number;
  examName: string;
  year?: number | null;
  result?: string | null;
  remarks?: string | null;
}
export interface UpdateUserExamAttemptDto {
  examName: string;
  year?: number | null;
  result?: string | null;
  remarks?: string | null;
}

export interface UserCoaching {
  id: number;
  coachingInstitute: string;
  courseName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}
export interface UpdateUserCoachingDto {
  coachingInstitute: string;
  courseName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UserPublication {
  id: number;
  title: string;
  journalConference?: string | null;
  publicationDate?: string | null;
  url?: string | null;
  abstract?: string | null;
}
export interface UpdateUserPublicationDto {
  title: string;
  journalConference?: string | null;
  publicationDate?: string | null;
  url?: string | null;
  abstract?: string | null;
}

export interface UserProject {
  id: number;
  projectName: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  url?: string | null;
}
export interface UpdateUserProjectDto {
  projectName: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  url?: string | null;
}

export interface UserCommunityGroup {
  id: number;
  groupName: string;
  description?: string | null;
  url?: string | null;
}
export interface UpdateUserCommunityGroupDto {
  groupName: string;
  description?: string | null;
  url?: string | null;
}