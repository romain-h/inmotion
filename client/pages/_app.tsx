import React from 'react';
import Router from 'next/router';
import withApollo from 'next-with-apollo';
import { ApolloProvider } from '@apollo/react-hooks';
import { Provider as StyletronProvider } from 'styletron-react';
import { BaseProvider } from 'baseui';
import { theme } from 'lib/theme';
import { styletron, debug } from 'lib/styletron';
import { AuthProvider } from 'lib/hooks/auth';
import { CreateApolloClient } from 'lib/gql/client';

import 'components/layout/reset.css';
import 'components/layout/font.css';
import 'video.js/dist/video-js.css';
import 'components/editor/player/overrides.css';

const onRedirectCallback = (appState) => {
  if (appState && appState.returnTo) {
    Router.push({
      pathname: appState.returnTo.pathname,
      query: appState.returnTo.query,
    });
  }
};

const App = ({ Component, pageProps, apollo }) => (
  <StyletronProvider value={styletron} debug={debug} debugAfterHydration>
    <BaseProvider theme={theme}>
      <AuthProvider
        domain={process.env.AUTH0_DOMAIN}
        clientID={process.env.AUTH0_CLIENT_ID}
        audience={process.env.AUTH0_AUDIENCE}
        redirectURI={'https://' + process.env.APP_HOST}
        onRedirectCallback={onRedirectCallback}
      >
        <ApolloProvider client={apollo}>
          <Component {...pageProps} />
        </ApolloProvider>
      </AuthProvider>
    </BaseProvider>
  </StyletronProvider>
);

export default withApollo(({ initialState }) => {
  return CreateApolloClient(initialState);
})(App);
