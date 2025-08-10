// lib/types/message.ts

// Basic user info for display within chat (sender, participant)
// Should match what your backend sends for a 'User' in chat context
export interface ChatUser {
  id: string; // Guid as string
  username: string;
  avatar?: string; // URL to profile picture
  // Add other relevant user fields if needed (e.g., firstName, lastName)
}

// Represents a single message in a conversation
export interface MessageDto {
  id: number; // Message.Id
  conversationId: number; // Message.ConversationId
  senderId: string; // Message.SenderId (Guid as string)
  content: string; // Message.Content
  sentAt: string; // Message.SentAt (ISO string)
  sender: ChatUser; // The user who sent the message
}

// Represents a participant in a conversation
export interface ConversationParticipantDto {
  conversationId: number;
  userId: string; // Guid as string
  joinedAt: string; // ISO string
  lastReadMessageAt: string; // ISO string
  user: ChatUser; // The actual user object
}

// Represents a conversation (chat room)
export interface ConversationDto {
  id: number; // Conversation.Id
  title: string; // Conversation.Title
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  participants: ConversationParticipantDto[]; // Participants in the conversation
  lastMessage?: MessageDto; // Optional: The last message in the conversation for recent chats list
  unreadCount?: number; // Optional: Number of unread messages for the current user
}

// DTO for sending a new message to the backend
export interface CreateMessageDto {
  content: string;
}

// DTO for creating a new conversation (e.g., 1:1 chat)
export interface CreateConversationDto {
  participantUserIds: string[]; // List of user IDs (Guids as strings) to include in the conversation
  title?: string; // Optional title for the conversation
}
