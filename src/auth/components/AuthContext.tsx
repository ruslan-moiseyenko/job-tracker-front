import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState
} from 'react';

import { type Auth, createAuthInstance } from '@/auth/client';

export const AuthContext = createContext<{
  auth: Auth;
  isReady: boolean;
}>({
  auth: createAuthInstance(),
  isReady: false
});

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [auth] = useState<Auth>(() => createAuthInstance());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      // If we're on a public route and explicitly logged out, skip auth check
      const isPublicRoute =
        window.location.pathname === '/login' ||
        window.location.pathname === '/register' ||
        window.location.pathname === '/';

      if (
        localStorage.getItem('apollo_logged_out') === 'true' &&
        isPublicRoute
      ) {
        console.log(
          'User is on public route and logged out, skipping auth check'
        );
        setIsReady(true);
        return;
      }

      // For protected routes or if not explicitly logged out, always check auth
      console.log('AuthProvider: Checking authentication...');
      await auth.checkAuth();
      console.log(
        'AuthProvider: Auth check completed, authenticated:',
        auth.isAuthenticated
      );
      setIsReady(true);
    };

    initialize();
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, isReady }}>
      {isReady ? children : <div>🔐 Authorization check...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
