import { useMutation } from '@apollo/client';

import { toast } from 'sonner';

import { createFragmentUtils } from '@/features/dashboard/graphql/cache-utils';
import { CREATE_APPLICATION_STAGE_MUTATION } from '@/features/dashboard/graphql/dashboard.queries';
import { logger } from '@/lib/logger';

interface CreateStageInput {
  name: string;
  description?: string;
  color?: string;
  insertAfter?: string;
}

export const useCreateStage = () => {
  const [createStage, { loading, error }] = useMutation(
    CREATE_APPLICATION_STAGE_MUTATION,
    {
      onCompleted: (data) => {
        logger.info(
          'Stage created successfully:',
          data.createApplicationStage.name
        );
        toast.success('Stage created successfully');
      },
      onError: (error) => {
        logger.error('Error creating stage:', error);
        toast.error('Failed to create stage. Please try again.');
      },
      // Update cache to add the new stage using fragment utilities
      update(cache, { data }) {
        if (data?.createApplicationStage) {
          const fragmentUtils = createFragmentUtils(cache);

          // The mutation response contains the complete ApplicationStageFragment
          const success = fragmentUtils.addStageToList(
            data.createApplicationStage
          );

          if (!success) {
            // Fallback: evict the cache to force refetch
            fragmentUtils.evictQuery('getAllStages');
          }
        }
      }
    }
  );

  const handleCreateStage = async (input: CreateStageInput) => {
    try {
      const result = await createStage({
        variables: {
          name: input.name,
          description: input.description || null,
          color: input.color || null,
          insertAfter: input.insertAfter || null
        }
      });
      return result.data?.createApplicationStage;
    } catch (error) {
      logger.error('Failed to create stage:', error);
      return null;
    }
  };

  return {
    createStage: handleCreateStage,
    loading,
    error
  };
};
