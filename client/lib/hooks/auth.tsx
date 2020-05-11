import React, {
  useState,
  useContext,
  createContext,
  useEffect,
  ReactNode,
} from 'react';
import * as authClient from 'lib/auth-client';
import { Auth0Client } from '@auth0/auth0-spa-js';

const DEFAULT_REDIRECT_CALLBACK = () =>
  window.history.replaceState({}, document.title, window.location.pathname);

interface Auth0ProviderProps {
  children: ReactNode;
  onRedirectCallback: (any) => void;
  audience: string;
  domain: string;
  clientID: string;
  redirectURI: string;
}

export interface Auth0ContextProps {
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;
  isPopupOpen: boolean;
  loginWithPopup: (any) => any;
  handleRedirectCallback: (any) => any;
  getIdTokenClaims: (any) => any;
  loginWithRedirect: (any) => any;
  getTokenSilently: (any) => any;
  getTokenWithPopup: (any) => any;
  logout: (any) => any;
}

export const AuthContext = createContext<Auth0ContextProps>(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<Auth0ProviderProps> = ({
  children,
  onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
  audience,
  domain,
  clientID,
  redirectURI,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState();
  const [auth0Client, setAuth0] = useState<Auth0Client>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isPopupOpen, setPopupOpen] = useState<boolean>(false);

  useEffect(() => {
    const initAuth0 = async () => {
      const auth0FromHook = await authClient.init({
        audience,
        domain,
        clientID,
        redirectURI,
      });
      setAuth0(auth0FromHook);

      if (window.location.search.includes('code=')) {
        const { appState } = await auth0FromHook.handleRedirectCallback();
        onRedirectCallback(appState);
      }

      const isAuthenticated = await auth0FromHook.isAuthenticated();

      setIsAuthenticated(isAuthenticated);

      if (isAuthenticated) {
        const user = await auth0FromHook.getUser();
        setUser(user);
      }

      setLoading(false);
    };

    initAuth0();
  }, [audience, domain, clientID, redirectURI, onRedirectCallback]);

  const loginWithPopup = async (params = {}) => {
    setPopupOpen(true);
    try {
      await auth0Client.loginWithPopup(params);
    } catch (error) {
      console.error(error);
    } finally {
      setPopupOpen(false);
    }
    const user = await auth0Client.getUser();
    setUser(user);
    setIsAuthenticated(true);
  };

  const handleRedirectCallback = async () => {
    setLoading(true);
    await auth0Client.handleRedirectCallback();
    const user = await auth0Client.getUser();
    setLoading(false);
    setIsAuthenticated(true);
    setUser(user);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        isPopupOpen,
        loginWithPopup,
        handleRedirectCallback,
        getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
        loginWithRedirect: (...p) => auth0Client.loginWithRedirect(...p),
        getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
        getTokenWithPopup: (...p) => auth0Client.getTokenWithPopup(...p),
        logout: (...p) => auth0Client.logout(...p),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
