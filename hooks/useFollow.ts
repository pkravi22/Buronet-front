import { useState, useCallback } from 'react';
import { get, postApi, remove } from '@/lib/api';

export interface FollowUserDto {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePictureMediaId: string | null;
  profilePictureUrl?: string | null;
  headline: string | null;
  isFollowedByCurrentUser: boolean;
}

export interface PaginatedFollowResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  data: FollowUserDto[];
}

export const useFollow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const getFollowers = useCallback(async (userId: string, page = 1, pageSize = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await get<PaginatedFollowResponse>(`/Follow/${userId}/followers?page=${page}&pageSize=${pageSize}`);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch followers');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFollowing = useCallback(async (userId: string, page = 1, pageSize = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await get<PaginatedFollowResponse>(`/Follow/${userId}/following?page=${page}&pageSize=${pageSize}`);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch following');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const followUser = useCallback(async (targetUserId: string) => {
    setError(null);
    try {
      const res = await postApi<any>(`/Follow/${targetUserId}`, {});
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to follow user');
      throw err;
    }
  }, []);

  const unfollowUser = useCallback(async (targetUserId: string) => {
    setError(null);
    try {
      const res = await remove<any>(`/Follow/${targetUserId}`);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to unfollow user');
      throw err;
    }
  }, []);

  const toggleFollow = useCallback(async (targetUserId: string) => {
    setError(null);
    try {
      const res = await postApi<any>(`/Follow/${targetUserId}/toggle`, {});
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to follow/unfollow user');
      throw err;
    }
  }, []);

  const getFollowStatus = useCallback(async (targetUserId: string) => {
    try {
      const res = await get<any>(`/Follow/${targetUserId}/status`);
      return res;
    } catch (err: any) {
      return null;
    }
  }, []);

  return {
    isLoading,
    error,
    clearError,
    getFollowers,
    getFollowing,
    followUser,
    unfollowUser,
    toggleFollow,
    getFollowStatus
  };
};
