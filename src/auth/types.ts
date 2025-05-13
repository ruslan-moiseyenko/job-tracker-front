export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export interface AuthClient {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export interface LoginMutationResult {
  login: {
    token: string;
    user: User;
  };
}

export interface MeQueryResult {
  me: User | null;
}
