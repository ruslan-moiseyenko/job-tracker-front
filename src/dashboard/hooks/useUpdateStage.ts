import { useMutation } from '@apollo/client';

import { toast } from 'sonner';

import {
  GET_ALL_STAGES,
  UPDATE_APPLICATION_STAGE_MUTATION
} from '@/dashboard/dashboard.queries';
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
      // Apollo will automatically update cache for existing objects
      refetchQueries: [{ query: GET_ALL_STAGES }]
    }
  );

  const handleUpdateStage = async (input: UpdateStageInput) => {
    try {
      const result = await updateStage({
        variables: {
          id: input.id,
          name: input.name || null,
          description: input.description || null,
          color: input.color || null
        }
      });
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
