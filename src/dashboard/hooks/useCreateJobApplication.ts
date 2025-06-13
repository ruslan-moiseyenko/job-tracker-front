import { useMutation } from '@apollo/client';

import {
  CREATE_JOB_APPLICATION_MUTATION,
  GET_APPLICATIONS_BY_SEARCH_ID
} from '@/dashboard/dashboard.queries';
import type {
  ApplicationType,
  CreateJobApplicationInput,
  JobApplication
} from '@/dashboard/dashboard.types';
import { logger } from '@/lib/logger';

export const useCreateJobApplication = () => {
  const [createJobApplication, { loading, error }] = useMutation<
    { createJobApplication: JobApplication },
    CreateJobApplicationInput
  >(CREATE_JOB_APPLICATION_MUTATION, {
    // Update Apollo cache after successful mutation
    update: (cache, { data }, { variables }) => {
      if (!data?.createJobApplication || !variables?.jobSearchId) return;

      try {
        // Read the current applications from cache
        const existingData = cache.readQuery<{
          getJobApplicationsBySearchId: ApplicationType[];
        }>({
          query: GET_APPLICATIONS_BY_SEARCH_ID,
          variables: { jobSearchId: variables.jobSearchId }
        });

        if (existingData?.getJobApplicationsBySearchId) {
          // Create a new application object using the full data from the mutation response
          const newApplication: ApplicationType = {
            id: data.createJobApplication.id,
            positionTitle: data.createJobApplication.positionTitle,
            jobDescription: data.createJobApplication.jobDescription || '',
            customColor: data.createJobApplication.customColor || '',
            applicationDate: data.createJobApplication.applicationDate,
            jobLinks: data.createJobApplication.jobLinks,
            salary: data.createJobApplication.salary || null,
            updatedAt: new Date(data.createJobApplication.updatedAt),
            createdAt: new Date(data.createJobApplication.createdAt),
            company: data.createJobApplication.company,
            currentStage: data.createJobApplication.currentStage
          };

          // Write the updated list back to cache
          cache.writeQuery({
            query: GET_APPLICATIONS_BY_SEARCH_ID,
            variables: { jobSearchId: variables.jobSearchId },
            data: {
              getJobApplicationsBySearchId: [
                newApplication,
                ...existingData.getJobApplicationsBySearchId
              ]
            }
          });
        }
      } catch (error) {
        logger.error('Error updating applications cache:', error);
        // Fallback: evict the cache to force refetch
        cache.evict({
          fieldName: 'getJobApplicationsBySearchId'
        });
      }
    },

    onError: (error) => {
      logger.error('Failed to create job application:', error);
    },

    onCompleted: (data) => {
      if (data.createJobApplication) {
        logger.info(
          `Successfully created job application: ${data.createJobApplication.positionTitle}`
        );
      }
    }
  });

  return {
    createJobApplication,
    loading,
    error
  };
};
