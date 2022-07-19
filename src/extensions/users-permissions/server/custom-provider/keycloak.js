"use strict";

const purest = require("purest");
const providerName = "keycloak";
const KEYCLOAK_SUBDOMAIN = process.env.KEYCLOAK_SUBDOMAIN;
const providerConfig = () => {
  return {
    enabled: true,
    icon: "comments",
    scope: ["openid"],
    subdomain: KEYCLOAK_SUBDOMAIN,
    key: process.env.KEYCLOAK_CLIENT_ID,
    secret: process.env.KEYCLOAK_CLIENT_SECRET,
    callback: process.env.REDIRECT_URL,
  };
};

const getProfile = (providers, access_token) => {
  const keycloak = purest({
    provider: providerName,
    defaults: {
      subdomain: providers[providerName].subdomain,
    },
  });
  return keycloak
    .get("protocol/openid-connect/userinfo")
    .auth(access_token)
    .request()
    .then(({ body }) => {
      if (body.email) {
        body.username = body.preferred_username;
        return body;
      }
      return { message: "Email was not available." };
    });
};

module.exports = {
  providerName,
  providerConfig,
  getProfile,
};
