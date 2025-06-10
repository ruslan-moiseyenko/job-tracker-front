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
