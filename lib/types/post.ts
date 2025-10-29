// lib/types/post.ts (Frontend - Modified)
// No PostUser interface needed if user data is flattened
// export interface PostUser { ... }
interface User { // Your core User type
  id: string; // CHAR(36) GUID
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  isAdmin: boolean;
  firstName: string;
  lastName: string;
  headline: string;
  profilePictureUrl: string;
  // PasswordHash and PasswordSalt are NOT here for security
}

export interface CommentDto {
  id: number;
  postId: number;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User; // Removed
  userName: string; // Added
  userEmail: string; // Added
}

export interface LikeDto {
  id: number;
  postId: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  // user: User; // Removed
  userName: string; // Added
  userEmail: string; // Added
}

// DTO for a poll option
export interface PollOptionDto {
  id: number;
  text: string;
  votes: number;
  hasVoted: boolean;
}

// DTO for a poll
export interface PollDto {
  id: number;
  options: PollOptionDto[];
  totalVotes: number;
}

export interface PostDto {
  id: number;
  userId: string;
  userName: string; // Matches backend PostDto
  firstName?: string;
  lastName?: string;
  userEmail: string; // Matches backend PostDto
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number; // Matches backend PostDto
  isLikedByCurrentUser: boolean;
  commentsCount: number; // Matches backend PostDto
  comments: CommentDto[];
  likes: LikeDto[];
  tagsJson?: string;
  tags?: string[];
  isPoll: boolean;
  poll?: PollDto;
  user?: User;

  // If you want profilePictureUrl and headline, you'd need to add them here
  // profilePictureUrl?: string;
  // headline?: string;
}

// DTO for creating a poll
export interface CreatePollDto {
  title: string;
  content: string;
  imageUrl: string | null;
  tags: string[];
  isPoll: boolean;
  options: string[]; // Poll options
}  

export interface CreatePostDto {
  title: string;
  content: string;
  imageUrl: string | null; // Can be null if not provided
  tagsJson: string[];
}

export interface CommentRequestDto {
  content: string;
}

export interface UpdatePostDto {
  title: string;
  content: string;
  imageUrl: string | null; // Can be null if not provided
}

export interface TagWithTotalCountDto {
  tagName: string;
  totalPosts: number;
  postsLastWeek: number;
  mostRecentPost: PostDto;
}

export interface PollVoteDto {
  pollId: number;
  pollOptionId: number;
  userId: string;
}