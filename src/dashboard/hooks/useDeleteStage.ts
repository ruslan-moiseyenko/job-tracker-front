import { useMutation } from '@apollo/client';

import { toast } from 'sonner';

import {
  DELETE_APPLICATION_STAGE_MUTATION,
  GET_ALL_STAGES
} from '@/dashboard/dashboard.queries';
import { logger } from '@/lib/logger';

export const useDeleteStage = () => {
  const [deleteStage, { loading, error }] = useMutation(
    DELETE_APPLICATION_STAGE_MUTATION,
    {
      onCompleted: (data) => {
        logger.info(
          'Stage deleted successfully:',
          data.deleteApplicationStage.id
        );
        toast.success('Stage deleted successfully');
      },
      onError: (error) => {
        logger.error('Error deleting stage:', error);
        toast.error('Failed to delete stage. Please try again.');
      },
      // Update cache to remove the deleted stage
      update(cache, { data }) {
        if (data?.deleteApplicationStage) {
          const existingStages = cache.readQuery({
            query: GET_ALL_STAGES
          });

          if (existingStages) {
            cache.writeQuery({
              query: GET_ALL_STAGES,
              data: {
                getAllStages: (existingStages as any).getAllStages.filter(
                  (stage: any) => stage.id !== data.deleteApplicationStage.id
                )
              }
            });
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
