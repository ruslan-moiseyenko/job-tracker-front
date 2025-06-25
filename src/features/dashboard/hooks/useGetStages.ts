import { useMemo } from 'react';

import { useQuery } from '@apollo/client';

import type { ApplicationStageType } from '@/features/dashboard/dashboard.types';
import { GET_ALL_STAGES } from '@/features/dashboard/graphql/dashboard.queries';
import { logger } from '@/lib/logger';

export const useGetStages = () => {
  const { data, loading, error, refetch } = useQuery<{
    getAllStages: ApplicationStageType[];
  }>(GET_ALL_STAGES, {
    fetchPolicy: 'cache-first', // Cache aggressively for rarely-changing data
    notifyOnNetworkStatusChange: false,
    errorPolicy: 'all'
  });

  if (error) {
    logger.error('Error fetching stages:', error);
  }

  const stages = useMemo(() => {
    return data?.getAllStages || [];
  }, [data?.getAllStages]);

  // Convert stages to filter options format (for backwards compatibility with existing components)
  const stageFilterOptions = useMemo(() => {
    return [...stages]
      .sort((a, b) => a.order - b.order)
      .map((stage) => ({
        value: stage.name.toLowerCase(),
        label: stage.name,
        id: stage.id,
        order: stage.order,
        color: stage.color
      }));
  }, [stages]);

  return {
    stages,
    stageFilterOptions,
    loading,
    error,
    refetch
  };
};
