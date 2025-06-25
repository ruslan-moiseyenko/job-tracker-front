import { useMutation } from '@apollo/client';

import type {
  CreateJobApplicationInput,
  JobApplication
} from '@/features/dashboard/dashboard.types';
import { createFragmentUtils } from '@/features/dashboard/graphql/cache-utils';
import { CREATE_JOB_APPLICATION_MUTATION } from '@/features/dashboard/graphql/dashboard.queries';
import type { JobApplicationFragment } from '@/features/dashboard/graphql/fragments';
import { logger } from '@/lib/logger';

export const useCreateJobApplication = () => {
  const [createJobApplication, { loading, error }] = useMutation<
    { createJobApplication: JobApplication },
    CreateJobApplicationInput
  >(CREATE_JOB_APPLICATION_MUTATION, {
    update: (cache, { data }, { variables }) => {
      if (!data?.createJobApplication || !variables?.jobSearchId) return;

      try {
        const fragmentUtils = createFragmentUtils(cache);

        // The mutation response contains the complete JobApplicationFragment
        // We need to cast it since the returned type is compatible
        const applicationFragment =
          data.createJobApplication as JobApplicationFragment;

        const success = fragmentUtils.addJobApplicationToList(
          applicationFragment,
          variables.jobSearchId
        );

        if (!success) {
          // Fallback: evict the cache to force refetch
          fragmentUtils.evictQuery('getJobApplicationsBySearchId');
        }
      } catch (error) {
        logger.error('Error updating applications cache:', error);
        // Fallback: evict the cache to force refetch
        cache.evict({
          fieldName: 'getJobApplicationsBySearchId'
        });
      }
    },

    onError: (error) => {
      logger.error('Failed to create job application:', error);
    },

    onCompleted: (data) => {
      if (data.createJobApplication) {
        logger.info(
          `Successfully created job application: ${data.createJobApplication.positionTitle}`
        );
      }
    }
  });

  return {
    createJobApplication,
    loading,
    error
  };
};
