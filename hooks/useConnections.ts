// hooks/useConnections.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { get, postApi, remove } from '../lib/api'; // Import get, postApi, and remove from your API utility
import { useAuth } from '../context/AuthContext'; // To get the current user ID
import { ConnectionDto, ConnectionRequestDto, SuggestedUserDto, SendRequestDto, PopularUserDto, NetworkMetrics } from '../lib/types/connections';
import { log } from 'console';

type SuggestedConnectionsMap = Record<string, SuggestedUserDto[]>;

interface UseConnectionsResult {
  connections: ConnectionDto[];
  networkMetrics: NetworkMetrics | null;
  pendingRequests: ConnectionRequestDto[];
  suggestedConnections: SuggestedConnectionsMap;
  suggestedGeneralConnections: SuggestedUserDto[];
  popularConnections: PopularUserDto[];
  isLoading: boolean;
  error: string | null;
  acceptRequest: (requestId: number) => Promise<void>;
  declineRequest: (requestId: number) => Promise<void>;
  sendRequest: (receiverId: string) => Promise<void>;
  refetchAll: () => void;
}

export const useConnections = (): UseConnectionsResult => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [connections, setConnections] = useState<ConnectionDto[]>([]);
  const [networkMetrics, setNetworkMetrics] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequestDto[]>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<SuggestedConnectionsMap>({});
  const [suggestedGeneralConnections, setSuggestedGeneralConnections] = useState<SuggestedUserDto[]>([]);
  const [popularConnections, setPopularConnections] = useState<PopularUserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const fetchAllData = useCallback(async () => {
    if (isAuthLoading || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Assuming a GET /api/connections/me endpoint
      const fetchedNetworkMetrics = await get<any>('/connections/metrics');
      setNetworkMetrics(fetchedNetworkMetrics);
      const fetchedConnections = await get<ConnectionDto[]>('/connections');
      setConnections(fetchedConnections);

      // Assuming a GET /api/connections/requests/pending endpoint
      const fetchedRequests = await get<ConnectionRequestDto[]>('/connections/requests/pending');
      console.log('Fetched pending requests:', fetchedRequests);
      setPendingRequests(fetchedRequests);

      // Assuming a GET /api/connections/suggestions endpoint
      const fetchedSuggestions = await get<SuggestedConnectionsMap>('/connections/suggestions');
      // const fetchedSuggestions: SuggestedUserDto = {
      //   id: '',
      //   username: '',
      //   firstName: '',
      //   lastName: '',
      //   profilePictureUrl: '',
      //   headline: '',
      //   mutualConnections: 0
      // };
      setSuggestedConnections(fetchedSuggestions);

      const suggestedConnectionsResponse = await get<SuggestedUserDto[]>('/connections/general-suggestions');
      setSuggestedGeneralConnections(suggestedConnectionsResponse);

      const fetchedPopular = await get<PopularUserDto[]>('/connections/popular');
      console.log('Fetched popular connections:', fetchedPopular);
      setPopularConnections(fetchedPopular);
    } catch (err: any) {
      setError(err.message || "Failed to load connection data.");
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData, refetchTrigger]);

  const refetchAll = () => setRefetchTrigger(prev => prev + 1);

  const acceptRequest = async (requestId: number) => {
    try {
      await postApi(`/connections/requests/${requestId}/accept`, {});
      refetchAll(); // Refetch all data to update the lists
    } catch (err: any) {
      setError(err.message || "Failed to accept connection request.");
    }
  };

  const declineRequest = async (requestId: number) => {
    try {
      await postApi(`/connections/requests/${requestId}/decline`, {});
      refetchAll(); // Refetch all data to update the lists
    } catch (err: any) {
      setError(err.message || "Failed to decline connection request.");
    }
  };

  const sendRequest = async (receiverId: string) => {
    try {
      // console.log('Sending connection request to:', receiverId);
      const sendRequest : SendRequestDto = {ReceiverId: receiverId}
      await postApi('/connections/send-request', receiverId);
      refetchAll(); // Refetch all data to update the lists
    } catch (err: any) {
      setError(err.message || "Failed to send connection request.");
    }
  };

  return {
    connections,
    networkMetrics,
    pendingRequests,
    popularConnections,
    suggestedConnections,
    suggestedGeneralConnections,
    isLoading,
    error,
    acceptRequest,
    declineRequest,
    sendRequest,
    refetchAll,
  };
};