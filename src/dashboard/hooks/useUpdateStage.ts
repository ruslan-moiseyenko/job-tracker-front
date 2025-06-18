import { useMutation } from '@apollo/client';

import { toast } from 'sonner';

import {
  GET_ALL_STAGES,
  UPDATE_APPLICATION_STAGE_MUTATION
} from '@/dashboard/dashboard.queries';
import type { ApplicationStageType } from '@/dashboard/dashboard.types';
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
      // Update cache to reflect the changes
      update(cache, { data }) {
        if (data?.updateApplicationStage) {
          try {
            // Read the current getAllStages query from cache
            const existingStages = cache.readQuery<{
              getAllStages: ApplicationStageType[];
            }>({
              query: GET_ALL_STAGES
            });

            if (existingStages?.getAllStages) {
              // Update the specific stage in the array
              const updatedStages = existingStages.getAllStages.map((stage) =>
                stage.id === data.updateApplicationStage.id
                  ? { ...stage, ...data.updateApplicationStage }
                  : stage
              );

              // Write the updated list back to cache
              cache.writeQuery({
                query: GET_ALL_STAGES,
                data: { getAllStages: updatedStages }
              });
            }
          } catch (error) {
            logger.error('Error updating cache after stage update:', error);
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
