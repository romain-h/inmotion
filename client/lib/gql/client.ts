import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink, split } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { get as getAuth0Client } from 'lib/auth-client';

const wsLink =
  typeof window === 'undefined'
    ? null
    : new WebSocketLink({
        uri: `wss://${process.env.API_HOST}/graphql`,
        options: {
          reconnect: true,
          lazy: true,
          connectionParams: async () => {
            const client = getAuth0Client();
            if (!client) return {};
            const token = await client.getTokenSilently();
            return {
              authToken: token,
            };
          },
        },
      });

const httpLink = new HttpLink({
  uri: `https://${process.env.API_HOST}/graphql`,
});

const authLink = setContext((_, { headers }) => {
  const client = getAuth0Client();

  if (!client) return { headers };
  return client.getTokenSilently().then((token) => {
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  });
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link =
  typeof window === 'undefined'
    ? authLink.concat(httpLink)
    : split(
        // split based on operation type
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink,
        authLink.concat(httpLink),
      );

export const CreateApolloClient = (initialState) =>
  new ApolloClient({
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path }) =>
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
            ),
          );
        if (networkError) console.log(`[Network error]: ${networkError}`);
      }),
      link,
    ]),
    cache: new InMemoryCache().restore(initialState || {}),
  });
