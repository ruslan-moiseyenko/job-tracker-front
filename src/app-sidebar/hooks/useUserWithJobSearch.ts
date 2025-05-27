import { useUserData } from '@/auth/hooks/useUserData';

import { useGetJobSearchById } from './useGetJobSearchById';

/**
 * Custom hook that properly handles the dependency chain between user data and job search
 * @returns user data, job search data, and combined loading state
 */
export function useUserWithJobSearch() {
  const {
    userData,
    loading: userDataLoading,
    error: userError
  } = useUserData();

  const {
    jobSearch,
    loading: jobSearchLoading,
    error: jobSearchError
  } = useGetJobSearchById(userData?.lastActiveSearchId);

  // Determine overall loading state
  const isLoading =
    userDataLoading || (userData?.lastActiveSearchId && jobSearchLoading);

  // Combine errors
  const errors = [userError, jobSearchError].filter(Boolean);

  return {
    userData,
    jobSearch,
    isLoading,
    userDataLoading,
    jobSearchLoading,
    errors: errors.length > 0 ? errors : null,
    hasActiveSearch: !!userData?.lastActiveSearchId,
    // Utility flags
    isUserLoaded: !userDataLoading && !!userData,
    isJobSearchLoaded:
      !jobSearchLoading && (!userData?.lastActiveSearchId || !!jobSearch)
  };
}
