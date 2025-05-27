import { useQuery } from '@apollo/client';

import { GET_ME_QUERY } from '@/auth/queries';
import { type User } from '@/auth/types';

import { logger } from '@/lib/logger';

/**
 * Custom hook to get user data from Apollo cache or network
 * @returns user data, loading state, error, and refetch function
 */
export function useUserData() {
  const { data, loading, error, refetch } = useQuery<{ me: User }>(
    GET_ME_QUERY,
    {
      fetchPolicy: 'cache-and-network', // Fetches from cache first, then network
      notifyOnNetworkStatusChange: true,
      errorPolicy: 'all'
    }
  );

  if (error) {
    logger.error('Error fetching user data:', error);
  }

  return {
    userData: data?.me || null,
    loading,
    error,
    refetch
  };
}
