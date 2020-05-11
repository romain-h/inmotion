import createAuth0Client, { Auth0Client } from '@auth0/auth0-spa-js';

// Singleton required here to reuse client in config like Apollo links
let client: Auth0Client;

interface AuthClientOptions {
  audience: string;
  clientID: string;
  domain: string;
  redirectURI: string;
}

export const init = async ({
  audience,
  clientID,
  domain,
  redirectURI,
}: AuthClientOptions) => {
  client = await createAuth0Client({
    domain,
    client_id: clientID,
    redirect_uri: redirectURI,
    audience,
  });

  return client;
};

export const get = (): Auth0Client => client;
