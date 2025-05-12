import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";
// Import from tag path to avoid SSR issues
import { gql } from "@apollo/client/core";
import * as reactHooks from "@apollo/client/react";
const { useApolloClient } = reactHooks;

// Define types for our auth context
type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
};

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: () => {},
  register: async () => {}
});

// GraphQL queries/mutations
const LOGIN_MUTATION = gql`
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

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      email
      firstName
      lastName
    }
  }
`;

// Define the auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("auth-token")
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const client = useApolloClient();
  const navigate = useNavigate();

  // Check for authenticated user on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await client.query({
          query: GET_ME_QUERY,
          context: {
            headers: {
              authorization: token ? `Bearer ${token}` : ""
            }
          }
        });

        if (data?.me) {
          setUser(data.me);
        } else {
          // Invalid token
          localStorage.removeItem("auth-token");
          setToken(null);
        }
      } catch (err) {
        console.error("Auth validation error:", err);
        localStorage.removeItem("auth-token");
        setToken(null);
        setError(
          err instanceof Error ? err : new Error("Authentication error")
        );
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [client, token]);

  // Login function
  const login = async (email: string, password: string) => {
    console.log("🚀 ~ login ~ email and pass:", email, password);
    setLoading(true);
    setError(null);

    try {
      const { data } = await client.mutate({
        mutation: LOGIN_MUTATION,
        variables: { email, password }
      });
      console.log("🚀 ~ login ~ LOGIN RESULT: ", data);

      if (data?.login?.accessToken) {
        localStorage.setItem("accessToken", data.login.accessToken);
        localStorage.setItem("refreshToken", data.login.refreshToken);
        setToken(data.login.token);
        setUser(data.login.user);
        navigate("/dashboard");
      } else {
        throw new Error("Login failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Login failed"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await client.mutate({
        mutation: REGISTER_MUTATION,
        variables: { input: userData }
      });

      if (data?.register?.token) {
        localStorage.setItem("auth-token", data.register.token);
        setToken(data.register.token);
        setUser(data.register.user);
        navigate("/dashboard");
      } else {
        throw new Error("Registration failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Registration failed"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("auth-token");
    setToken(null);
    setUser(null);

    // Reset Apollo store to clear cached data
    client.resetStore();

    // Redirect to login page
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
