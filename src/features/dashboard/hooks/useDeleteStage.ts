import { useMutation } from '@apollo/client';

import { toast } from 'sonner';

import { DELETE_APPLICATION_STAGE_MUTATION } from '@/features/dashboard/graphql/dashboard.queries';
import { logger } from '@/lib/logger';

export const useDeleteStage = () => {
  const [deleteStage, { loading, error }] = useMutation(
    DELETE_APPLICATION_STAGE_MUTATION,
    {
      onCompleted: (_data) => {
        toast.success('Stage deleted successfully');
      },
      onError: (_error) => {
        toast.error('Failed to delete stage. Please try again.');
      },
      // Update cache by removing the deleted stage from getAllStages query
      update(cache, { data }) {
        if (data?.deleteApplicationStage) {
          try {
            // Remove the stage from cache using cache.evict for direct removal
            const stageId = cache.identify({
              __typename: 'ApplicationStageType',
              id: data.deleteApplicationStage.id
            });

            if (stageId) {
              // Evict the specific stage from cache
              cache.evict({ id: stageId });

              // Clean up any dangling references
              cache.gc();
            }
          } catch (error) {
            logger.error('Error updating cache after stage deletion:', error);
            // Fallback: evict all stages to force refetch
            cache.evict({ fieldName: 'getAllStages' });
          }
        }
      }
    }
  );

  const handleDeleteStage = async (id: string) => {
    try {
      await deleteStage({
        variables: { id }
      });
      return true;
    } catch (error) {
      logger.error('Failed to delete stage:', error);
      return false;
    }
  };

  return {
    deleteStage: handleDeleteStage,
    loading,
    error
  };
};
