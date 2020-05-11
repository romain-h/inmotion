const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require('next/constants');

// This uses phases as outlined here: https://nextjs.org/docs/#custom-configuration
module.exports = (phase) => {
  // when started in development mode `next dev` or `npm run dev` regardless of the value of STAGING environmental variable
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  // when `next build` or `npm run build` is used
  const isProd =
    phase === PHASE_PRODUCTION_BUILD && process.env.STAGING !== '1';
  // when `next build` or `npm run build` is used
  const isStaging =
    phase === PHASE_PRODUCTION_BUILD && process.env.STAGING === '1';

  console.log(`isDev:${isDev}  isProd:${isProd}   isStaging:${isStaging}`);

  const env = {
    APP_HOST: (() => {
      if (isDev) return 'inmotion.dev';
      if (isProd) return 'inmotion.hrdy.me';
      if (isStaging) return 'NULL';
      return 'APP_HOST:not (isDev,isProd && !isStaging,isProd && isStaging)';
    })(),
    API_HOST: (() => {
      if (isDev) return 'api.inmotion.dev';
      if (isProd) return 'api.inmotion.hrdy.me';
      if (isStaging) return 'NULL';
      return 'API_HOST:not (isDev,isProd && !isStaging,isProd && isStaging)';
    })(),
    AUTH0_DOMAIN: (() => {
      if (isDev) return 'dev-mwd5gkm1.eu.auth0.com';
      if (isProd) return 'prod-mwd5gkm1.eu.auth0.com';
      if (isStaging) return 'NULL';
      return 'AUTH0_DOMAIN:not (isDev,isProd && !isStaging,isProd && isStaging)';
    })(),
    AUTH0_CLIENT_ID: (() => {
      if (isDev) return 'F6eFf14CYnlt2T8OsVFiXWMo4LAz1b3f';
      if (isProd) return 'Y6O8WFkbxkygIJKlH0KrcDgMZp8HPqtw';
      if (isStaging) return 'NULL';
      return 'AUTH0_CLIENT_ID:not (isDev,isProd && !isStaging,isProd && isStaging)';
    })(),
    AUTH0_AUDIENCE: (() => {
      if (isDev) return 'https://api.inmotion';
      if (isProd) return 'https://api.inmotion';
      if (isStaging) return 'NULL';
      return 'AUTH0_AUDIENCE:not (isDev,isProd && !isStaging,isProd && isStaging)';
    })(),
  };

  // next.config.js object
  return {
    env,
    webpack: function (config) {
      config.externals = config.externals || {};
      config.externals['styletron-server'] = 'styletron-server';
      return config;
    },
  };
};
