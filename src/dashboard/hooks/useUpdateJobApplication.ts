import { useMutation } from '@apollo/client';

import { UPDATE_JOB_APPLICATION } from '@/dashboard/dashboard.queries';

export function useUpdateJobApplication() {
  const [updateJobApplication, { loading, error, data }] = useMutation(
    UPDATE_JOB_APPLICATION,
    {
      update(cache, { data }) {
        if (!data?.updateJobApplication) return;
        const updated = data.updateJobApplication;
        // Find all queries for job applications by search id in the cache
        const cacheQueries = cache.extract();
        Object.keys(cacheQueries).forEach((key) => {
          if (key.startsWith('JobApplication:') && key.endsWith(updated.id)) {
            // Directly update the application entity in the cache
            cache.modify({
              id: key,
              fields: {
                currentStage() {
                  return updated.currentStage;
                },
                // Optionally update other fields if needed
                positionTitle() {
                  return updated.positionTitle;
                },
                jobDescription() {
                  return updated.jobDescription;
                },
                customColor() {
                  return updated.customColor;
                },
                jobLinks() {
                  return updated.jobLinks;
                },
                salary() {
                  return updated.salary;
                },
                updatedAt() {
                  return updated.updatedAt;
                },
                createdAt() {
                  return updated.createdAt;
                },
                applicationDate() {
                  return updated.applicationDate;
                }
              }
            });
          }
        });
      }
    }
  );
  return { updateJobApplication, loading, error, data };
}
