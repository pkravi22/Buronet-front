// lib/types/connections.ts

import { UserProfile } from "./user";


export interface NetworkMetrics {
  totalConnections: number;
  pendingRequests: number;
  acceptedRequests: number;
  networkGrowth: number;
  totalConnectionsTrend: number,
  joinedGroups: number,
  joinedGroupsTrend: number,
  pendingRequestsTrend: number,
  networkGrowthPercentage: number
}
// Basic user info for display
export interface UserForConnection {
  id: string; // Guid as string
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  headline?: string;
  // Add other user profile fields needed for display
}

// DTO for a single connection
export interface ConnectionDto {
  id: number;
  connectedUserId: string; // The ID of the user who initiated the connection
  connectedUserName: string; // The ID of the user who accepted
  connectedUserHeadline: string; // The full user object for User1
  connectedUserProfilePictureUrl: string; // The full user object for User2
  connectedUser: UserProfile;
  createdAt: string;
}

// DTO for a connection request
export interface ConnectionRequestDto {
  id: number;
  senderId: string;
  receiverId: string;
  sender: UserForConnection; // The full user object for the sender
  receiver: UserForConnection; // The full user object for the receiver
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';
  createdAt: string;
}

export interface SendRequestDto {
  ReceiverId: string;
}

// DTO for a suggested user to connect with
export interface SuggestedUserDto {
  id: string; // User ID
  username: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  headline?: string;
  mutualConnections?: number;
}
export interface PopularUserDto {
  id: string; // User ID
  username: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  headline?: string;
  mutualConnections?: number;
}