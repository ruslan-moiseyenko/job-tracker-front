import { useMutation } from '@apollo/client';

import { createFragmentUtils } from '@/dashboard/graphql/cache-utils';
import { UPDATE_JOB_APPLICATION } from '@/dashboard/graphql/dashboard.queries';
import { logger } from '@/lib/logger';

export function useUpdateJobApplication() {
  const [updateJobApplication, { loading, error, data }] = useMutation(
    UPDATE_JOB_APPLICATION,
    {
      onCompleted: (data) => {
        logger.info(
          'Job application updated successfully:',
          data.updateJobApplication.id
        );
      },
      onError: (error) => {
        logger.error('Error updating job application:', error);
      },
      update(cache, { data }) {
        if (!data?.updateJobApplication) return;

        const updatedApplication = data.updateJobApplication;

        try {
          const fragmentUtils = createFragmentUtils(cache);

          // Update the job application using fragment
          const success = fragmentUtils.updateJobApplication(
            updatedApplication.id,
            updatedApplication
          );

          if (!success) {
            logger.warn(
              'Failed to update job application in cache, application not found'
            );
          }
        } catch (error) {
          logger.error('Error updating job application cache:', error);
          // Apollo's automatic cache update will still work as fallback
        }
      }
    }
  );

  return { updateJobApplication, loading, error, data };
}
