export type SearchItemType = 'User' | 'Job' | 'Post' | 'Group' | 'Exam';

export interface UserSearchResultPayload {
  profilePictureUrl: string;
  currentPosition: string;
  location: string;
  /** GUID of the user — used to render the Follow button inline in search results */
  userId: string;
  /** True when the currently authenticated user already follows this person */
  isFollowedByCurrentUser: boolean;
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
  payload: UserSearchResultPayload | JobSearchResultPayload | any;
}

export interface SearchResultDto {
  results: UnifiedSearchResultItem[];
  totalUserCount: number;
  totalJobCount: number;
}
