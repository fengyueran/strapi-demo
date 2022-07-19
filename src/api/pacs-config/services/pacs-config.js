'use strict';

/**
 * pacs-config service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::pacs-config.pacs-config');
