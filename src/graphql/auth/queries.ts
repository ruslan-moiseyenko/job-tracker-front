import { gql } from "@apollo/client";

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      email
      firstName
      lastName
    }
  }
`;
