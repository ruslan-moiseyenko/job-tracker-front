import { gql } from '@apollo/client';

export const GET_SEARCH_BY_ID = gql`
  query getJobSearchById($id: String!) {
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
export const GET_ALL_SEARCHES = gql`
  query getJobSearches(
    $filter: JobSearchFilterInput
    $pagination: PaginationInput
  ) {
    getAllJobSearches(filter: $filter, pagination: $pagination) {
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

export const SET_LAST_ACTIVE_SEARCH = gql`
  mutation setLastActiveJobSearch($searchId: String!) {
    setLastActiveSearch(searchId: $searchId)
  }
`;

export const GET_LAST_ACTIVE_SEARCH = gql`
  query getLastActiveJobSearch {
    getLastActiveSearch
  }
`;
