import { useMutation } from '@apollo/client';

import { toast } from 'sonner';

import {
  GET_ALL_STAGES,
  REORDER_STAGE_MUTATION
} from '@/dashboard/dashboard.queries';
import { logger } from '@/lib/logger';

interface ReorderStageInput {
  stageId: string;
  position: string; // "before:stage_id" | "after:stage_id" | "first" | "last"
}

export const useReorderStage = () => {
  const [reorderStage, { loading, error }] = useMutation(
    REORDER_STAGE_MUTATION,
    {
      onCompleted: (data) => {
        logger.info('Stage reordered successfully:', data.reorderStage.name);
        toast.success('Stage order updated successfully');
      },
      onError: (error) => {
        logger.error('Error reordering stage:', error);
        toast.error('Failed to reorder stage. Please try again.');
      },
      // Refetch stages to ensure correct order
      refetchQueries: [{ query: GET_ALL_STAGES }]
    }
  );

  const handleReorderStage = async (input: ReorderStageInput) => {
    try {
      const result = await reorderStage({
        variables: {
          stageId: input.stageId,
          position: input.position
        }
      });
      return result.data?.reorderStage;
    } catch (error) {
      logger.error('Failed to reorder stage:', error);
      return null;
    }
  };

  return {
    reorderStage: handleReorderStage,
    loading,
    error
  };
};
