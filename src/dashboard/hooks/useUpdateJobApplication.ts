import { useMutation } from '@apollo/client';

import { UPDATE_JOB_APPLICATION } from '@/dashboard/dashboard.queries';

export function useUpdateJobApplication() {
  const [updateJobApplication, { loading, error, data }] = useMutation(
    UPDATE_JOB_APPLICATION,
    {
      update(cache, { data }) {
        if (!data?.updateJobApplication) return;

        const updatedApplication = data.updateJobApplication;

        try {
          const applicationId = cache.identify({
            __typename: 'ApplicationType',
            id: updatedApplication.id
          });

          if (applicationId) {
            cache.modify({
              id: applicationId,
              fields: {
                currentStage() {
                  return updatedApplication.currentStage;
                },
                company() {
                  return updatedApplication.company;
                },
                positionTitle() {
                  return updatedApplication.positionTitle;
                },
                jobDescription() {
                  return updatedApplication.jobDescription;
                },
                customColor() {
                  return updatedApplication.customColor;
                },
                jobLinks() {
                  return updatedApplication.jobLinks;
                },
                salary() {
                  return updatedApplication.salary;
                },
                updatedAt() {
                  return updatedApplication.updatedAt;
                },
                applicationDate() {
                  return updatedApplication.applicationDate;
                }
              }
            });
          }
        } catch (error) {
          console.error('Error updating job application cache:', error);
          // Apollo's automatic cache update will still work as fallback
        }
      }
    }
  );

  return { updateJobApplication, loading, error, data };
}
