import { ApolloCache } from '@apollo/client';

import {
  GET_ALL_STAGES,
  GET_APPLICATIONS_BY_SEARCH_ID
} from './dashboard.queries';
import {
  APPLICATION_STAGE_FRAGMENT,
  type ApplicationStageFragment,
  COMPANY_FRAGMENT,
  type CompanyFragment,
  JOB_APPLICATION_FRAGMENT,
  type JobApplicationFragment
} from './fragments';

// =============================================================================
// CACHE UTILITIES FOR FRAGMENT OPERATIONS
// =============================================================================

/**
 * Cache utilities for working with fragments
 * Provides type-safe, consistent cache operations across the application
 */
export class FragmentCacheUtils {
  constructor(private cache: ApolloCache<any>) {}

  // ---------------------------------------------------------------------------
  // APPLICATION STAGE OPERATIONS
  // ---------------------------------------------------------------------------

  /**
   * Read application stage from cache using fragment
   */
  readStage(stageId: string): ApplicationStageFragment | null {
    try {
      const cacheId = this.cache.identify({
        __typename: 'ApplicationStageType',
        id: stageId
      });

      if (!cacheId) return null;

      return this.cache.readFragment({
        id: cacheId,
        fragment: APPLICATION_STAGE_FRAGMENT
      });
    } catch (error) {
      console.warn('Failed to read stage from cache:', error);
      return null;
    }
  }

  /**
   * Write application stage to cache using fragment
   */
  writeStage(stage: ApplicationStageFragment): boolean {
    try {
      const cacheId = this.cache.identify({
        __typename: 'ApplicationStageType',
        id: stage.id
      });

      if (!cacheId) return false;

      this.cache.writeFragment({
        id: cacheId,
        fragment: APPLICATION_STAGE_FRAGMENT,
        data: stage
      });

      return true;
    } catch (error) {
      console.warn('Failed to write stage to cache:', error);
      return false;
    }
  }

  /**
   * Update application stage in cache with partial data
   */
  updateStage(
    stageId: string,
    updates: Partial<Omit<ApplicationStageFragment, '__typename' | 'id'>>
  ): boolean {
    const existingStage = this.readStage(stageId);
    if (!existingStage) return false;

    const updatedStage: ApplicationStageFragment = {
      ...existingStage,
      ...updates
    };

    return this.writeStage(updatedStage);
  }

  // ---------------------------------------------------------------------------
  // JOB APPLICATION OPERATIONS
  // ---------------------------------------------------------------------------

  /**
   * Read job application from cache using fragment
   */
  readJobApplication(applicationId: string): JobApplicationFragment | null {
    try {
      const cacheId = this.cache.identify({
        __typename: 'JobApplicationType',
        id: applicationId
      });

      if (!cacheId) return null;

      return this.cache.readFragment({
        id: cacheId,
        fragment: JOB_APPLICATION_FRAGMENT
      });
    } catch (error) {
      console.warn('Failed to read job application from cache:', error);
      return null;
    }
  }

  /**
   * Write job application to cache using fragment
   */
  writeJobApplication(application: JobApplicationFragment): boolean {
    try {
      const cacheId = this.cache.identify({
        __typename: 'JobApplicationType',
        id: application.id
      });

      if (!cacheId) return false;

      this.cache.writeFragment({
        id: cacheId,
        fragment: JOB_APPLICATION_FRAGMENT,
        data: application
      });

      return true;
    } catch (error) {
      console.warn('Failed to write job application to cache:', error);
      return false;
    }
  }

  /**
   * Update job application in cache with partial data
   */
  updateJobApplication(
    applicationId: string,
    updates: Partial<Omit<JobApplicationFragment, '__typename' | 'id'>>
  ): boolean {
    const existingApplication = this.readJobApplication(applicationId);
    if (!existingApplication) return false;

    const updatedApplication: JobApplicationFragment = {
      ...existingApplication,
      ...updates
    };

    return this.writeJobApplication(updatedApplication);
  }

  // ---------------------------------------------------------------------------
  // COMPANY OPERATIONS
  // ---------------------------------------------------------------------------

  /**
   * Read company from cache using fragment
   */
  readCompany(companyId: string): CompanyFragment | null {
    try {
      const cacheId = this.cache.identify({
        __typename: 'CompanyType',
        id: companyId
      });

      if (!cacheId) return null;

      return this.cache.readFragment({
        id: cacheId,
        fragment: COMPANY_FRAGMENT
      });
    } catch (error) {
      console.warn('Failed to read company from cache:', error);
      return null;
    }
  }

  /**
   * Write company to cache using fragment
   */
  writeCompany(company: CompanyFragment): boolean {
    try {
      const cacheId = this.cache.identify({
        __typename: 'CompanyType',
        id: company.id
      });

      if (!cacheId) return false;

      this.cache.writeFragment({
        id: cacheId,
        fragment: COMPANY_FRAGMENT,
        data: company
      });

      return true;
    } catch (error) {
      console.warn('Failed to write company to cache:', error);
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // LIST OPERATIONS FOR QUERY CACHE UPDATES
  // ---------------------------------------------------------------------------

  /**
   * Add a new stage to the GET_ALL_STAGES query cache
   */
  addStageToList(newStage: ApplicationStageFragment): boolean {
    try {
      const existingData = this.cache.readQuery<{
        getAllStages: ApplicationStageFragment[];
      }>({
        query: GET_ALL_STAGES
      });

      if (existingData?.getAllStages) {
        this.cache.writeQuery({
          query: GET_ALL_STAGES,
          data: {
            getAllStages: [...existingData.getAllStages, newStage]
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Failed to add stage to list cache:', error);
      return false;
    }
  }

  /**
   * Add a new job application to the GET_APPLICATIONS_BY_SEARCH_ID query cache
   */
  addJobApplicationToList(
    newApplication: JobApplicationFragment,
    jobSearchId: string
  ): boolean {
    try {
      const existingData = this.cache.readQuery<{
        getJobApplicationsBySearchId: JobApplicationFragment[];
      }>({
        query: GET_APPLICATIONS_BY_SEARCH_ID,
        variables: { jobSearchId }
      });

      if (existingData?.getJobApplicationsBySearchId) {
        this.cache.writeQuery({
          query: GET_APPLICATIONS_BY_SEARCH_ID,
          variables: { jobSearchId },
          data: {
            getJobApplicationsBySearchId: [
              newApplication,
              ...existingData.getJobApplicationsBySearchId
            ]
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Failed to add job application to list cache:', error);
      return false;
    }
  }

  /**
   * Evict a query from cache (fallback for cache update failures)
   */
  evictQuery(fieldName: string): void {
    try {
      this.cache.evict({ fieldName });
    } catch (error) {
      console.warn(`Failed to evict query ${fieldName}:`, error);
    }
  }

  // ---------------------------------------------------------------------------
  // UTILITY METHODS
  // ---------------------------------------------------------------------------

  /**
   * Helper to create cache utilities instance
   */
  static create(cache: ApolloCache<any>): FragmentCacheUtils {
    return new FragmentCacheUtils(cache);
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create fragment cache utils for use in hooks
 */
export const createFragmentUtils = (cache: ApolloCache<any>) => {
  return FragmentCacheUtils.create(cache);
};
