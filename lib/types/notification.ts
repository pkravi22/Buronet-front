// buronet/types/notification.ts

export type NotificationType = 
    | 'ConnectionAccepted' 
    | 'ConnectionRequestReceived' 
    | 'JobBookmarkAdded' 
    | 'ExamBookmarkAdded' 
    | 'PostLiked';

export interface NotificationDto {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    redirectUrl: string;
    isRead: boolean;
    createdAt: string; // ISO date string
    timeAgo: string; // Already formatted by the server
}