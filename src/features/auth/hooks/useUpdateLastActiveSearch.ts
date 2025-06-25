import { useMutation } from '@apollo/client';

import { SET_LAST_ACTIVE_SEARCH } from '@/app-sidebar/sidebar.queries';
import { GET_ME_QUERY } from '@/auth/queries';
import type { User } from '@/auth/types';
import { logger } from '@/lib/logger';

interface SetLastActiveSearchResponse {
  setLastActiveSearch: boolean;
}

interface SetLastActiveSearchVariables {
  searchId: string;
}

/**
 * Hook for updating the user's lastActiveSearchId with optimistic updates
 * Automatically updates the Apollo cache to trigger reactivity across the app
 */
export function useUpdateLastActiveSearch() {
  const [setLastActiveSearchMutation, { loading, error }] = useMutation<
    SetLastActiveSearchResponse,
    SetLastActiveSearchVariables
  >(SET_LAST_ACTIVE_SEARCH, {
    // Update Apollo cache immediately (optimistic update)
    update: (cache, { data }, { variables }) => {
      if (!data?.setLastActiveSearch || !variables?.searchId) return;

      try {
        // Read current user data from cache
        const existingData = cache.readQuery<{ me: User }>({
          query: GET_ME_QUERY
        });

        if (existingData?.me) {
          // Write updated user data back to cache
          cache.writeQuery({
            query: GET_ME_QUERY,
            data: {
              me: {
                ...existingData.me,
                lastActiveSearchId: variables.searchId
              }
            }
          });

          logger.info(
            `Cache updated with new lastActiveSearchId: ${variables.searchId}`
          );
        }
      } catch (error) {
        logger.error(
          'Error updating cache after lastActiveSearchId update:',
          error
        );
      }
    },

    // Error handling
    onError: (error) => {
      logger.error('Failed to update lastActiveSearchId:', error);
    },

    onCompleted: (data) => {
      if (data.setLastActiveSearch) {
        logger.info('Successfully updated lastActiveSearchId');
      }
    }
  });

  const updateLastActiveSearch = async (searchId: string) => {
    try {
      const result = await setLastActiveSearchMutation({
        variables: { searchId },
        // Optimistic response for immediate UI update
        optimisticResponse: {
          setLastActiveSearch: true
        }
      });

      return result.data?.setLastActiveSearch || false;
    } catch (error) {
      logger.error('Error updating active search ID:', error);
      throw error;
    }
  };

  return {
    updateLastActiveSearch,
    loading,
    error
  };
}
