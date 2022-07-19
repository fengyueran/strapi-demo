'use strict';

/**
 * Module dependencies.
 */

// Public node modules.
const _ = require('lodash');
const urlJoin = require('url-join');

const { getAbsoluteServerUrl } = require('@strapi/utils');
const {keycloak, dvauthprovider} = require('../custom-provider');

module.exports = ({ strapi }) => {
  const providerRequest = require('@strapi/plugin-users-permissions/server/services/providers-list');
  /**
   * Helper to get profiles
   *
   * @param {String}   provider
   */
  // Purest strategies.
  const getProfile = async (provider, query) => {
    const access_token = query.access_token || query.code || query.oauth_token;
    const user_id = query.userID

    const providers = await strapi
      .store({ type: 'plugin', name: 'users-permissions', key: 'grant' })
      .get();

    switch (provider) {
      case keycloak.providerName:
        return keycloak.getProfile(providers, access_token);
      case dvauthprovider.providerName:
        return dvauthprovider.getProfile(providers, access_token, user_id); 
    }
  
    return providerRequest({ provider, query, access_token, providers });
  };

  /**
   * Connect thanks to a third-party provider.
   *
   *
   * @param {String}    provider
   * @param {String}    access_token
   *
   * @return  {*}
   */

  const connect = (provider, query) => {
    const access_token = query.access_token || query.code || query.oauth_token;
    console.log('enter connect');
    return new Promise((resolve, reject) => {
      if (!access_token) {
        return reject({ message: 'No access_token.' });
      }

      // Get the profile.
      getProfile(provider, query)
        .then(async profile => {
          const email = _.toLower(profile.email);

          // We need at least the mail.
          if (!email) {
            return reject({ message: 'Email was not available.' });
          }

          try {
            const users = await strapi.query('plugin::users-permissions.user').findMany({
              where: { email },
            });

            const advanced = await strapi
              .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
              .get();

            const user = _.find(users, { provider });

            if (_.isEmpty(user) && !advanced.allow_register) {
              return reject({ message: 'Register action is actually not available.' });
            }

            if (!_.isEmpty(user)) {
              return resolve(user);
            }

            if (
              !_.isEmpty(_.find(users, user => user.provider !== provider)) &&
              advanced.unique_email
            ) {
              return reject({ message: 'Email is already taken.' });
            }

            // Retrieve default role.
            const defaultRole = await strapi
              .query('plugin::users-permissions.role')
              .findOne({ where: { type: advanced.default_role } });

            // Create the new user.
            const params = {
              ...profile,
              email, // overwrite with lowercased email
              provider,
              role: defaultRole.id,
              confirmed: true,
            };

            const createdUser = await strapi
              .query('plugin::users-permissions.user')
              .create({ data: params });

            return resolve(createdUser);
          } catch (err) {
            reject(err);
          }
        })
        .catch(reject);
    });
  };

  const buildRedirectUri = (provider = '') => {
    const apiPrefix = strapi.config.get('api.rest.prefix');
    return urlJoin(getAbsoluteServerUrl(strapi.config), apiPrefix, 'connect', provider, 'callback');
  };

  return {
    connect,
    buildRedirectUri,
  };
};
