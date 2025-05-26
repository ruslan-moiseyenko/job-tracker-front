import { useQuery } from '@apollo/client';

import { GET_SEARCH_BY_ID } from '@/app-sidebar/queries';

import { logger } from '@/lib/logger';

export const useGetJobSearchById = (id: string) => {
  const { data, loading, error, refetch } = useQuery(GET_SEARCH_BY_ID, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all'
  });

  if (error) {
    logger.error('Error fetching job search by ID:', error);
  }

  return {
    jobSearch: data?.getJobSearchById || null,
    loading,
    error,
    refetch
  };
};
