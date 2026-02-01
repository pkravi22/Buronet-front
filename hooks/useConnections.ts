// hooks/useConnections.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { get, postApi, remove } from '../lib/api'; // Import get, postApi, and remove from your API utility
import { useAuth } from '../context/AuthContext'; // To get the current user ID
import { ConnectionDto, ConnectionRequestDto, SuggestedUserDto, PopularUserDto, NetworkMetrics } from '../lib/types/connections';
import { log } from 'console';

type SuggestedConnectionsMap = Record<string, SuggestedUserDto[]>;

interface UseConnectionsResult {
  connections: ConnectionDto[];
  networkMetrics: NetworkMetrics | null;
  pendingRequests: ConnectionRequestDto[];
  pendingIncomingRequests: ConnectionRequestDto[];
  pendingOutgoingRequests: ConnectionRequestDto[];
  suggestedConnections: SuggestedConnectionsMap;
  suggestedGeneralConnections: SuggestedUserDto[];
  popularConnections: PopularUserDto[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  acceptRequest: (requestId: number) => Promise<void>;
  declineRequest: (requestId: number) => Promise<void>;
  sendRequest: (receiverId: string) => Promise<void>;
  refetchAll: () => void;
}

export const useConnections = (options?: { includeOutgoingPending?: boolean }): UseConnectionsResult => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [connections, setConnections] = useState<ConnectionDto[]>([]);
  const [networkMetrics, setNetworkMetrics] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequestDto[]>([]);
  const [pendingIncomingRequests, setPendingIncomingRequests] = useState<ConnectionRequestDto[]>([]);
  const [pendingOutgoingRequests, setPendingOutgoingRequests] = useState<ConnectionRequestDto[]>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<SuggestedConnectionsMap>({});
  const [suggestedGeneralConnections, setSuggestedGeneralConnections] = useState<SuggestedUserDto[]>([]);
  const [popularConnections, setPopularConnections] = useState<PopularUserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const fetchAllData = useCallback(async () => {
    // Important: don't mark this hook as "not loading" while auth is still resolving.
    // Otherwise pages can briefly render with empty connection state (e.g. showing "Connect")
    // before the real pending requests arrive.
    if (isAuthLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const fetchedNetworkMetrics = await get<any>('/connections/metrics');
      setNetworkMetrics(fetchedNetworkMetrics);
      const fetchedConnections = await get<ConnectionDto[]>('/connections');
      setConnections(fetchedConnections);

      // Default behavior: keep the original backend response as-is.
      // (Do NOT combine incoming/outgoing in this hook.)
      const fetchedPending = await get<ConnectionRequestDto[]>('/connections/requests/pending');
      setPendingRequests(fetchedPending);
      setPendingIncomingRequests(fetchedPending);

      // Optional: fetch outgoing pending requests ONLY when requested by a consumer (e.g. other user's profile page).
      if (options?.includeOutgoingPending) {
        const fetchedOutgoing = await get<ConnectionRequestDto[]>('/connections/requests/pending?outgoing=true');
        setPendingOutgoingRequests(fetchedOutgoing);
      } else {
        setPendingOutgoingRequests([]);
      }

      const fetchedSuggestions = await get<SuggestedConnectionsMap>('/connections/suggestions');
      setSuggestedConnections(fetchedSuggestions);

      const suggestedConnectionsResponse = await get<SuggestedUserDto[]>('/connections/general-suggestions');
      setSuggestedGeneralConnections(suggestedConnectionsResponse);

      const fetchedPopular = await get<PopularUserDto[]>('/connections/popular');
      console.log('Fetched popular connections:', fetchedPopular);
      setPopularConnections(fetchedPopular);
    } catch (err: any) {
      clearError();
      setError(err.message || "Failed to load connection data.");
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthLoading, options?.includeOutgoingPending]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData, refetchTrigger]);

  const refetchAll = () => setRefetchTrigger(prev => prev + 1);

  const acceptRequest = async (requestId: number) => {
    try {
      await postApi(`/connections/requests/${requestId}/accept`, {});
      refetchAll(); // Refetch all data to update the lists
    } catch (err: any) {
      clearError();
      setError(err.message || "Failed to accept connection request.");
    }
  };

  const declineRequest = async (requestId: number) => {
    try {
      await postApi(`/connections/requests/${requestId}/reject`, {});
      refetchAll(); // Refetch all data to update the lists
    } catch (err: any) {
      clearError();
      setError(err.message || "Failed to decline connection request.");
    }
  };

  const sendRequest = async (receiverId: string) => {
    const markRequestAsPendingLocally = () => {
      // Optimistic UI update: ensure receiver is marked as pending immediately.
      setPendingRequests((prev) => {
        const alreadyPending = prev.some(
          (r) => r.status === 'Pending' && r.senderId === user?.id && r.receiverId === receiverId
        );
        if (alreadyPending) return prev;

        return [
          {
            id: -Date.now(),
            senderId: user?.id ?? '',
            receiverId,
            sender: {
              id: user?.id ?? '',
              username: user?.username ?? '',
              email: user?.email ?? '',
              firstName: user?.username ?? '',
              lastName: '',
              profilePictureUrl: '',
              headline: '',
            },
            receiver: {
              id: receiverId,
              username: '',
              email: '',
              firstName: '',
              lastName: '',
              profilePictureUrl: '',
              headline: '',
            },
            status: 'Pending',
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ];
      });

      // If this hook instance is tracking outgoing requests, update that list too.
      if (options?.includeOutgoingPending) {
        setPendingOutgoingRequests((prev) => {
          const alreadyPending = prev.some(
            (r) => r.status === 'Pending' && r.senderId === user?.id && r.receiverId === receiverId
          );
          if (alreadyPending) return prev;

          return [
            {
              id: -Date.now(),
              senderId: user?.id ?? '',
              receiverId,
              sender: {
                id: user?.id ?? '',
                username: user?.username ?? '',
                email: user?.email ?? '',
                firstName: user?.username ?? '',
                lastName: '',
                profilePictureUrl: '',
                headline: '',
              },
              receiver: {
                id: receiverId,
                username: '',
                email: '',
                firstName: '',
                lastName: '',
                profilePictureUrl: '',
                headline: '',
              },
              status: 'Pending',
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ];
        });
      }
    };

    try {
      console.log('Sending connection request to:', receiverId);
      if (!user?.id) {
        throw new Error('User not authenticated.');
      }

      // Backend expects a raw Guid in the request body (not a DTO object).
      // Sending a string here results in JSON like: "<guid>", which System.Text.Json can parse as Guid.
      const res = await postApi('/connections/send-request', receiverId);
      console.log('Connection request sent successfully:', res);

      // Only update this card locally; avoid refetching all connection state.
      markRequestAsPendingLocally();
    } catch (err: any) {
      const message = (err?.message ?? '').toString();
      // If the server says it's pending/already sent, treat it as a no-op success and just update the card.
      const isPendingNoop = /(connection|request).*(pending)|pending.*(connection|request)|already\s+pending|already\s+sent/i.test(message);
      if (isPendingNoop) {
        markRequestAsPendingLocally();
        return;
      }

      clearError();
      setError(message || "Failed to send connection request.");
    }
  };

  const clearError = () => setError(null);

  return {
    connections,
    networkMetrics,
    pendingRequests,
    pendingIncomingRequests,
    pendingOutgoingRequests,
    popularConnections,
    suggestedConnections,
    suggestedGeneralConnections,
    isLoading,
    error,
    clearError,
    acceptRequest,
    declineRequest,
    sendRequest,
    refetchAll,
  };
};