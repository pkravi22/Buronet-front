export type SearchItemType = 'User' | 'Job' | 'Post' | 'Group' | 'Exam';

export interface UserSearchResultPayload {
  profilePictureUrl: string;
  currentPosition: string;
  location: string;
}

export interface JobSearchResultPayload {
  companyName: string;
  location: string;
  jobType: string;
  applyLink: string;
}

export interface UnifiedSearchResultItem {
  id: string;
  type: SearchItemType;
  title: string;
  subtitle: string;
  linkUrl: string;
  payload: UserSearchResultPayload | JobSearchResultPayload | any; // Use 'any' for other types for now
}

export interface SearchResultDto {
  results: UnifiedSearchResultItem[];
  totalUserCount: number;
  totalJobCount: number;
  // totalPostCount: number; // Add other counts as your backend supports them
}