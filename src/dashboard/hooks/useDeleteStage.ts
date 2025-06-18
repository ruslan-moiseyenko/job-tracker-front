import { useMutation } from '@apollo/client';

import { toast } from 'sonner';

import {
  DELETE_APPLICATION_STAGE_MUTATION,
  GET_ALL_STAGES
} from '@/dashboard/dashboard.queries';
import type { ApplicationStageType } from '@/dashboard/dashboard.types';
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
            // Read the current getAllStages query from cache
            const existingStages = cache.readQuery<{
              getAllStages: ApplicationStageType[];
            }>({
              query: GET_ALL_STAGES
            });

            if (existingStages?.getAllStages) {
              // Filter out the deleted stage
              const updatedStages = existingStages.getAllStages.filter(
                (stage) => stage.id !== data.deleteApplicationStage.id
              );

              // Write the updated list back to cache
              cache.writeQuery({
                query: GET_ALL_STAGES,
                data: { getAllStages: updatedStages }
              });
            }
          } catch (error) {
            logger.error('Error updating cache after stage deletion:', error);
            // Fallback: refetch if cache update fails
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
