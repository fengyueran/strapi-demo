'use strict';

const purest = require('purest');
const providerName = 'dvauthprovider';
const DVAUTHPROVIDER_URL = process.env.DVAUTHPROVIDER_URL;
const providerConfig = (baseURL) => {
  return {
    authorize_url: `${DVAUTHPROVIDER_URL}/oauth/authorize`,
    access_url: `${DVAUTHPROVIDER_URL}/oauth/token`,
    origin: `${DVAUTHPROVIDER_URL}`,
    oauth: 2,
    enabled: true,
    icon: 'comments',
    key: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
    callback: process.env.REDIRECT_URL,
    scope: ['user'],
    custom_params: {
      "re_url": "",
    },
  };
};

const getProfile = (providers, access_token, user_id) => {
  const headerconf = {
    [providerName]: {
      default: {
        headers: {
          Authorization: 'Bearer {auth}',
          'Client-Id': '{auth}',
          user_id: user_id,
        },
      },
    },
  }
  const kyconf = {
    provider: providerName,
    config: headerconf,
    defaults: {
      headers: {
        'user-agent': 'strapi',
      },
    },
  }
  const dvProvider = purest(kyconf);
  return dvProvider
    .get(providers[providerName]['origin'] + '/oauth/user')
    .auth(access_token)
    .request()
    .then(({ body }) => {
      // This is the public email on the dv-authprovider profile
      if (body.email) {
        return body;
      }
      return { message: "Email was not available." };
    });
};

module.exports = {
  providerName,
  providerConfig,
  getProfile
}

