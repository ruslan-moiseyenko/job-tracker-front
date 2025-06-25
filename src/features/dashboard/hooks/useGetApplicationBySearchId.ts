import { useMemo } from 'react';

import { useQuery } from '@apollo/client';

import type { ApplicationType } from '@/features/dashboard/dashboard.types';
import { GET_APPLICATIONS_BY_SEARCH_ID } from '@/features/dashboard/graphql/dashboard.queries';
import { logger } from '@/lib/logger';

export const useGetApplicationBySearchId = (
  searchId: string | undefined | null
) => {
  const { data, loading, error, refetch } = useQuery<{
    getJobApplicationsBySearchId: ApplicationType[];
  }>(GET_APPLICATIONS_BY_SEARCH_ID, {
    variables: { jobSearchId: searchId || '' },
    skip: !searchId || searchId.trim() === '',
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: false,
    errorPolicy: 'all'
  });

  if (error) {
    logger.error('Error fetching applications by search ID:', error);
  }

  // Memoize applications array to prevent pagination infinite loop
  const applications = useMemo(() => {
    return data?.getJobApplicationsBySearchId || [];
  }, [data?.getJobApplicationsBySearchId]);

  return {
    applications,
    loading,
    error,
    refetch
  };
};
