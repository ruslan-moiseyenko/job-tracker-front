import { gql } from '@apollo/client';

export const GET_SEARCH_BY_ID = gql`
  query getJobSearches($id: String!) {
    getJobSearchById(id: $id) {
      id
      title
      description
      createdAt
      startDate
      endDate
      isActive
      createdAt
      updatedAt
    }
  }
`;
