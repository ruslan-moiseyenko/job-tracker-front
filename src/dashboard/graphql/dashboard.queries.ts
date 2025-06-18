import { gql } from '@apollo/client';

import {
  APPLICATION_STAGE_FRAGMENT,
  JOB_APPLICATION_FRAGMENT
} from './fragments';

export const GET_APPLICATIONS_BY_SEARCH_ID = gql`
  query getJobApplicationsBySearchId($jobSearchId: String!) {
    getJobApplicationsBySearchId(jobSearchId: $jobSearchId) {
      ...JobApplicationFragment
    }
  }
  ${JOB_APPLICATION_FRAGMENT}
`;

export const GET_ALL_STAGES = gql`
  query getAllStages {
    getAllStages {
      ...ApplicationStageFragment
    }
  }
  ${APPLICATION_STAGE_FRAGMENT}
`;

export const CREATE_JOB_APPLICATION_MUTATION = gql`
  mutation createJobApplication(
    $currentStageId: String
    $customColor: String
    $jobDescription: String
    $jobSearchId: String!
    $positionTitle: String!
    $salary: Int
    $company: CompanyInput!
    $jobLinks: [String!]!
  ) {
    createJobApplication(
      input: {
        company: $company
        currentStageId: $currentStageId
        customColor: $customColor
        jobDescription: $jobDescription
        jobLinks: $jobLinks
        jobSearchId: $jobSearchId
        positionTitle: $positionTitle
        salary: $salary
      }
    ) {
      ...JobApplicationFragment
    }
  }
  ${JOB_APPLICATION_FRAGMENT}
`;

export const DELETE_APPLICATION_STAGE_MUTATION = gql`
  mutation deleteStage($id: String!) {
    deleteApplicationStage(id: $id) {
      id
    }
  }
`;

export const CREATE_APPLICATION_STAGE_MUTATION = gql`
  mutation createApplicationStage(
    $name: String!
    $insertAfter: String
    $description: String
    $color: String
  ) {
    createApplicationStage(
      input: {
        name: $name
        insertAfter: $insertAfter
        description: $description
        color: $color
      }
    ) {
      ...ApplicationStageFragment
    }
  }
  ${APPLICATION_STAGE_FRAGMENT}
`;

export const UPDATE_APPLICATION_STAGE_MUTATION = gql`
  mutation updateApplicationStage(
    $id: String!
    $name: String
    $description: String
    $color: String
  ) {
    updateApplicationStage(
      id: $id
      input: { name: $name, description: $description, color: $color }
    ) {
      ...ApplicationStageFragment
    }
  }
  ${APPLICATION_STAGE_FRAGMENT}
`;

export const REORDER_STAGE_MUTATION = gql`
  mutation reorderStage($stageId: String!, $position: String!) {
    reorderStage(input: { stageId: $stageId, position: $position }) {
      ...ApplicationStageFragment
    }
  }
  ${APPLICATION_STAGE_FRAGMENT}
`;

export const UPDATE_JOB_APPLICATION = gql`
  mutation updateJobApplication(
    $id: String!
    $currentStageId: String
    $customColor: String
    $jobDescription: String
    $positionTitle: String
    $salary: Int
    $companyId: String
    $jobLinks: [String!]
  ) {
    updateJobApplication(
      id: $id
      input: {
        companyId: $companyId
        currentStageId: $currentStageId
        customColor: $customColor
        jobDescription: $jobDescription
        jobLinks: $jobLinks
        positionTitle: $positionTitle
        salary: $salary
      }
    ) {
      ...JobApplicationFragment
    }
  }
  ${JOB_APPLICATION_FRAGMENT}
`;
