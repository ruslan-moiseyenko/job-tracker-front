import { gql } from '@apollo/client';

// =============================================================================
// CORE ENTITY FRAGMENTS
// =============================================================================

/**
 * Company fragment - represents company data across all operations
 * Used in: job applications, company search, company creation
 */
export const COMPANY_FRAGMENT = gql`
  fragment CompanyFragment on CompanyType {
    id
    name
  }
`;

/**
 * Application Stage fragment - represents stage data across all operations
 * Used in: stage management, job applications, stage operations
 */
export const APPLICATION_STAGE_FRAGMENT = gql`
  fragment ApplicationStageFragment on ApplicationStageType {
    id
    name
    description
    color
    order
  }
`;

// =============================================================================
// COMPOSITE FRAGMENTS
// =============================================================================

/**
 * Job Application fragment - complete application data with nested entities
 * Used in: application queries, updates, creation
 * Composes: CompanyFragment, ApplicationStageFragment
 */
export const JOB_APPLICATION_FRAGMENT = gql`
  fragment JobApplicationFragment on JobApplicationType {
    id
    positionTitle
    jobDescription
    customColor
    applicationDate
    jobLinks
    salary
    updatedAt
    createdAt
    company {
      ...CompanyFragment
    }
    currentStage {
      ...ApplicationStageFragment
    }
  }
  ${COMPANY_FRAGMENT}
  ${APPLICATION_STAGE_FRAGMENT}
`;

// =============================================================================
// FRAGMENT TYPE DEFINITIONS (for TypeScript)
// =============================================================================

export interface CompanyFragment {
  __typename: 'CompanyType';
  id: string;
  name: string;
}

export interface ApplicationStageFragment {
  __typename: 'ApplicationStageType';
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  order: number;
}

export interface JobApplicationFragment {
  __typename: 'JobApplicationType';
  id: string;
  positionTitle: string;
  jobDescription: string | null;
  customColor: string | null;
  applicationDate: string;
  jobLinks: string[];
  salary: number | null;
  updatedAt: string;
  createdAt: string;
  company: CompanyFragment;
  currentStage: ApplicationStageFragment;
}
