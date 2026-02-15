// context/UnreadMessagesContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { get } from '@/lib/messageApi';
import { useAuth } from './AuthContext';
import { ConversationDto } from '@/lib/types/message';

interface UnreadMessagesContextType {
  totalUnreadCount: number;
  /** Call this to force a re-fetch from the API (e.g. after opening a chat) */
  refetchUnreadCount: () => void;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType>({
  totalUnreadCount: 0,
  refetchUnreadCount: () => {},
});

// Polling interval: check for new unread messages every 30 seconds
const POLL_INTERVAL_MS = 30_000;

export const UnreadMessagesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch total unread count from API by summing unread counts across all conversations
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const conversations = await get<ConversationDto[]>('/conversations');
      const total = (conversations || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setTotalUnreadCount(total);
    } catch (err) {
      // Silently fail — don't block the UI for a badge count
      console.error('UnreadMessages: Failed to fetch unread count', err);
    }
  }, [user?.id]);

  const refetchUnreadCount = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Initial fetch + periodic polling
  useEffect(() => {
    if (isAuthLoading || !user?.id) return;

    // Fetch immediately
    fetchUnreadCount();

    // Poll periodically
    intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user?.id, isAuthLoading, fetchUnreadCount]);

  // Also refetch when the page regains focus (user switches back to the tab)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) fetchUnreadCount();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id, fetchUnreadCount]);

  return (
    <UnreadMessagesContext.Provider value={{ totalUnreadCount, refetchUnreadCount }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => useContext(UnreadMessagesContext);
