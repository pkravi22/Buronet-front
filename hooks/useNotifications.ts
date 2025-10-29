// buronet/hooks/useNotifications.ts (Custom Implementation)

import { useState, useEffect, useCallback } from 'react';
import { get, put } from '@/lib/api'; // <--- USE YOUR CUSTOM API FUNCTIONS
import { NotificationDto } from '@/lib/types/notification'; // Ensure this path is correct

interface NotificationHook {
    notifications: NotificationDto[];
    unreadCount: number;
    isLoading: boolean;
    error: any;
    markAsRead: (id: string) => void;
    refresh: () => void;
}

export const useNotifications = (): NotificationHook => {
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [refreshIndex, setRefreshIndex] = useState(0); // State to manually trigger refresh

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Your API endpoint
            const data = await get('/notifications'); 
            setNotifications(data as NotificationDto[]);
        } catch (err) {
            setError(err);
            console.error("Failed to fetch notifications:", err);
            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch and timed refresh
    useEffect(() => {
        fetchNotifications();
        
        // Polling interval (e.g., every 60 seconds)
        const interval = setInterval(() => {
            fetchNotifications();
        }, 60000);

        return () => clearInterval(interval);
    }, [fetchNotifications, refreshIndex]); 
    // refreshIndex is added to the dependency array to allow manual refreshing

    const markAsRead = useCallback(async (id: string) => {
        // 1. Optimistic UI Update (Update local state instantly)
        setNotifications(prev => prev.map(n => 
            n.id === id ? { ...n, isRead: true } : n
        ));

        try {
            // 2. Call the PUT endpoint on your backend
            await put(`/notifications/mark-read/${id}`, {});
        } catch (e) {
            // 3. Optional: If API fails, you might want to revert the state 
            //    or force a full refresh.
            console.error("Failed to mark notification as read:", e);
            // setRefreshIndex(prev => prev + 1); // Force a refresh if needed
        }
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return { 
        notifications, 
        unreadCount, 
        isLoading, 
        error, 
        markAsRead, 
        refresh: () => setRefreshIndex(prev => prev + 1)
    };
};