import { gql } from '@apollo/client';

export const REFRESH_TOKEN = gql`
  mutation refreshToken {
    refreshToken {
      success
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      user {
        email
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      email
      firstName
      lastName
      lastActiveSearchId
      updatedAt
      createdAt
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;
