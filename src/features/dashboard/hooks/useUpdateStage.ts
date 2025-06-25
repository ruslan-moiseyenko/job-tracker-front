import { useMutation } from '@apollo/client';

import { toast } from 'sonner';

import { createFragmentUtils } from '@/features/dashboard/graphql/cache-utils';
import { UPDATE_APPLICATION_STAGE_MUTATION } from '@/features/dashboard/graphql/dashboard.queries';
import { logger } from '@/lib/logger';

interface UpdateStageInput {
  id: string;
  name?: string;
  description?: string;
  color?: string;
}

export const useUpdateStage = () => {
  const [updateStage, { loading, error }] = useMutation(
    UPDATE_APPLICATION_STAGE_MUTATION,
    {
      onCompleted: (data) => {
        logger.info(
          'Stage updated successfully:',
          data.updateApplicationStage.name
        );
        toast.success('Stage updated successfully');
      },
      onError: (error) => {
        logger.error('Error updating stage:', error);
        toast.error('Failed to update stage. Please try again.');
      },
      // Update cache using fragment-based approach
      update(cache, { data }) {
        if (data?.updateApplicationStage) {
          try {
            const fragmentUtils = createFragmentUtils(cache);

            // Update the stage using fragment
            const success = fragmentUtils.updateStage(
              data.updateApplicationStage.id,
              data.updateApplicationStage
            );

            if (!success) {
              logger.warn('Failed to update stage in cache, stage not found');
            }
          } catch (error) {
            logger.error('Error updating stage cache:', error);
          }
        }
      }
    }
  );

  const handleUpdateStage = async (input: UpdateStageInput) => {
    try {
      const result = await updateStage({ variables: input });
      return result.data?.updateApplicationStage;
    } catch (error) {
      logger.error('Failed to update stage:', error);
      return null;
    }
  };

  return {
    updateStage: handleUpdateStage,
    loading,
    error
  };
};
