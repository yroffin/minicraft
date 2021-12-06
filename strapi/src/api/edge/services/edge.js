'use strict';

/**
 * edge service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::edge.edge');
