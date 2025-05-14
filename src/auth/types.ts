export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export interface IRegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface IAuthClient {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: IRegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export interface ILoginMutationResponse {
  login: {
    accessToken: string;
    refreshToken: string;
    user: {
      email: string;
    };
  };
}

export interface IRegistrationMutationResponse {
  register: {
    refreshToken: string;
    accessToken: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IMeQueryResponse {
  me: User | null;
}

export interface RefreshTokenResponse {
  refreshToken: {
    accessToken: string;
    refreshToken: string;
  };
}
