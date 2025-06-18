import { useMutation } from '@apollo/client';

import { toast } from 'sonner';

import { createFragmentUtils } from '@/dashboard/graphql/cache-utils';
import { REORDER_STAGE_MUTATION } from '@/dashboard/graphql/dashboard.queries';
import { logger } from '@/lib/logger';

interface ReorderStageInput {
  stageId: string;
  position: string; // "before:stage_id" | "after:stage_id" | "first" | "last"
}

export const useReorderStage = () => {
  const [reorderStage, { loading, error }] = useMutation(
    REORDER_STAGE_MUTATION,
    {
      update: (cache, { data }) => {
        if (!data?.reorderStage) return;

        try {
          const fragmentUtils = createFragmentUtils(cache);

          // Write the complete updated stage to cache using fragment utilities
          const success = fragmentUtils.writeStage(data.reorderStage);

          if (!success) {
            // Fallback: evict the stages query to force refetch
            fragmentUtils.evictQuery('getAllStages');
          }
        } catch (error) {
          logger.error('Error updating stage cache after reorder:', error);
          // Fallback: evict the cache to force refetch
          cache.evict({ fieldName: 'getAllStages' });
        }
      },
      onCompleted: (data) => {
        logger.info('Stage reordered successfully:', data.reorderStage.name);
        toast.success('Stage order updated successfully');
      },
      onError: (error) => {
        logger.error('Error reordering stage:', error);
        toast.error('Failed to reorder stage. Please try again.');
      }
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
