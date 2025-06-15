import { useMutation } from '@apollo/client';

import { toast } from 'sonner';

import {
  CREATE_APPLICATION_STAGE_MUTATION,
  GET_ALL_STAGES
} from '@/dashboard/dashboard.queries';
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
      // Update cache to add the new stage
      update(cache, { data }) {
        if (data?.createApplicationStage) {
          const existingStages = cache.readQuery({
            query: GET_ALL_STAGES
          });

          if (existingStages) {
            cache.writeQuery({
              query: GET_ALL_STAGES,
              data: {
                getAllStages: [
                  ...(existingStages as any).getAllStages,
                  data.createApplicationStage
                ]
              }
            });
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
