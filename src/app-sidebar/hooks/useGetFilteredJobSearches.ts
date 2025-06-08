import { useQuery } from '@apollo/client';

import { GET_ALL_SEARCHES } from '@/app-sidebar/sidebar.queries';
import type { JobSearchType } from '@/app-sidebar/sidebar.types';
import { logger } from '@/lib/logger';

// Types for filter and pagination
export interface JobSearchFilterInput {
  /** Searches both title and description fields */
  title?: string;
  /** Filters by active/inactive status */
  isActive?: boolean;
  /** Filters by date range */
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  /** Filters by whether the search has applications */
  hasApplications?: boolean;
}

export interface PaginationInput {
  /** Pagination offset (defaults to 0) */
  offset?: number;
  /** Limit number of results (defaults to 10) */
  limit?: number;
}

export interface UseGetFilteredJobSearchesParams {
  /** Optional filter criteria */
  filter?: JobSearchFilterInput;
  /** Optional pagination settings */
  pagination?: PaginationInput;
}

/**
 * Custom hook for fetching all job searches with optional filtering and pagination
 *
 * @param params - Configuration object containing filter and pagination options
 * @param params.filter - Optional filter criteria for searching job searches
 * @param params.filter.title - Search term for title and description fields
 * @param params.filter.isActive - Filter by active/inactive status
 * @param params.filter.dateRange - Filter by date range (startDate and endDate)
 * @param params.filter.hasApplications - Filter by whether search has applications
 * @param params.pagination - Optional pagination settings
 * @param params.pagination.offset - Number of records to skip (defaults to 0)
 * @param params.pagination.limit - Maximum number of records to return (defaults to 10)
 *
 * @returns Object containing job searches data, loading state, error, and refetch function
 * @returns returns.allJobSearches - Array of job search objects
 * @returns returns.loading - Boolean indicating if query is in progress
 * @returns returns.error - Apollo error object if query failed
 * @returns returns.refetch - Function to manually refetch the data
 *
 * @example
 * ```typescript
 * // Basic usage without filters
 * const { allJobSearches, loading, error } = useGetAllJobSearches();
 *
 * // With filters and pagination
 * const { allJobSearches, loading, error, refetch } = useGetAllJobSearches({
 *   filter: {
 *     isActive: true,
 *     title: "senior developer",
 *     hasApplications: true
 *   },
 *   pagination: {
 *     offset: 10,
 *     limit: 20
 *   }
 * });
 * ```
 */
export const useGetFilteredJobSearches = (
  params?: UseGetFilteredJobSearchesParams
) => {
  const { data, loading, error, refetch } = useQuery<{
    getAllJobSearches: JobSearchType[];
  }>(GET_ALL_SEARCHES, {
    variables: {
      filter: params?.filter,
      pagination: params?.pagination
    },
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: false,
    errorPolicy: 'all'
  });

  if (error) {
    logger.error('Error fetching job search by ID:', error);
  }

  return {
    allJobSearches: data?.getAllJobSearches || [],
    loading,
    error,
    refetch
  };
};
