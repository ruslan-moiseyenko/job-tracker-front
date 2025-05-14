import { gql } from "@apollo/client/core";

export const REFRESH_TOKEN = gql`
  mutation refreshToken($refreshToken: String!) {
    refreshToken(input: { refreshToken: $refreshToken }) {
      accessToken
      refreshToken
    }
  }
`;

export interface RefreshTokenResponse {
  refreshToken: {
    accessToken: string;
    refreshToken: string;
  };
}
