import { gql } from '@apollo/client';

export const GET_APPLICATIONS_BY_SEARCH_ID = gql`
  query getJobApplicationsBySearchId($jobSearchId: String!) {
    getJobApplicationsBySearchId(jobSearchId: $jobSearchId) {
      id
      company {
        id
        name
      }
      currentStage {
        id
        name
        order
        color
      }
      positionTitle
      jobDescription
      customColor
      applicationDate
      jobLinks
      salary
      updatedAt
      createdAt
    }
  }
`;

export const GET_ALL_STAGES = gql`
  query getAllStages {
    getAllStages {
      id
      name
      description
      order
      color
    }
  }
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
        id
        name
      }
      currentStage {
        id
        name
        order
        color
      }
    }
  }
`;
