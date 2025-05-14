import { gql } from "@apollo/client";

export const REFRESH_TOKEN = gql`
  mutation refreshToken($refreshToken: String!) {
    refreshToken(input: { refreshToken: $refreshToken }) {
      accessToken
      refreshToken
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      accessToken
      refreshToken
      user {
        email
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
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
    }
  }
`;
