import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'lib/hooks/auth';
import Header from 'components/layout/header';

export default ({ children }) => {
  const router = useRouter();
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth();

  useEffect(() => {
    if (isLoading || isAuthenticated) {
      return;
    }

    const fn = async () => {
      await loginWithRedirect({
        appState: {
          returnTo: {
            pathname: router.pathname,
            query: router.query,
          },
        },
      });
    };
    fn();
  }, [isLoading, isAuthenticated, loginWithRedirect, router]);

  if (isLoading || !isAuthenticated) {
    return <Header />;
  }
  return children;
};
