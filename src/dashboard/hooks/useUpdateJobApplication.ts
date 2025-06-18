import { useMutation } from '@apollo/client';

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
      }
    }
  );

  return { updateJobApplication, loading, error, data };
}
