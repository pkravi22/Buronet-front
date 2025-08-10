// lib/types/post.ts (Frontend - Modified)
// No PostUser interface needed if user data is flattened
// export interface PostUser { ... }

export interface CommentDto {
  id: number;
  postId: number;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  // user: PostUser; // Removed
  userName: string; // Added
  userEmail: string; // Added
}

export interface LikeDto {
  id: number;
  postId: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  // user: PostUser; // Removed
  userName: string; // Added
  userEmail: string; // Added
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
  // If you want profilePictureUrl and headline, you'd need to add them here
  // profilePictureUrl?: string;
  // headline?: string;
}

export interface CreatePostDto {
  title: string;
  content: string;
  imageUrl: string | null; // Can be null if not provided
  tagsJson: string;
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