import { useQuery } from '@apollo/client';

import { GET_SEARCH_BY_ID } from '@/features/app-sidebar/sidebar.queries';
import type { JobSearchType } from '@/features/app-sidebar/sidebar.types';
import { logger } from '@/lib/logger';

export const useGetJobSearchById = (id: string | undefined | null) => {
  const { data, loading, error, refetch } = useQuery<{
    getJobSearchById: JobSearchType;
  }>(GET_SEARCH_BY_ID, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: false,
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
