import { useMutation } from '@apollo/client';

import { CREATE_JOB_SEARCH } from '@/app-sidebar/sidebar.queries';
import type { JobSearchType } from '@/app-sidebar/sidebar.types';
import { logger } from '@/lib/logger';

import { useUpdateLastActiveSearch } from './useUpdateLastActiveSearch';

interface CreateJobSearchResponse {
  createJobSearch: JobSearchType;
}

interface CreateJobSearchVariables {
  title: string;
  description?: string;
}

interface CreateJobSearchInput {
  title: string;
  description?: string;
}

/**
 * Hook for creating a new job search and automatically setting it as active
 * Automatically updates the Apollo cache and sets the new search as lastActiveSearchId
 */
export function useCreateJobSearch() {
  const { updateLastActiveSearch } = useUpdateLastActiveSearch();

  const [createJobSearchMutation, { loading, error }] = useMutation<
    CreateJobSearchResponse,
    CreateJobSearchVariables
  >(CREATE_JOB_SEARCH, {
    // Update cache by evicting all GET_ALL_SEARCHES queries to force refetch
    update: (cache, { data }) => {
      if (!data?.createJobSearch) return;

      try {
        // Evict all cached results for GET_ALL_SEARCHES queries
        // This will cause any component using useGetFilteredJobSearches to refetch
        cache.evict({
          fieldName: 'getAllJobSearches'
        });

        // Trigger garbage collection to clean up evicted entries
        cache.gc();

        logger.info(
          `Cache evicted for job search queries after creating: ${data.createJobSearch.title}`
        );
      } catch (error) {
        logger.error('Error evicting cache after job search creation:', error);
      }
    },

    onError: (error) => {
      logger.error('Failed to create job search:', error);
    },

    onCompleted: (data) => {
      if (data.createJobSearch) {
        logger.info(
          `Successfully created job search: ${data.createJobSearch.title}`
        );
      }
    }
  });

  const createJobSearch = async (input: CreateJobSearchInput) => {
    try {
      const result = await createJobSearchMutation({
        variables: {
          title: input.title,
          description: input.description
        }
      });

      if (result.data?.createJobSearch) {
        const newJobSearch = result.data.createJobSearch;

        // Automatically set the newly created search as active
        try {
          await updateLastActiveSearch(newJobSearch.id);
          logger.info(
            `Set newly created job search as active: ${newJobSearch.id}`
          );
        } catch (updateError) {
          logger.error(
            'Failed to set newly created job search as active:',
            updateError
          );
        }

        return newJobSearch;
      }

      return null;
    } catch (error) {
      logger.error('Error creating job search:', error);
      throw error;
    }
  };

  return {
    createJobSearch,
    loading,
    error
  };
}
