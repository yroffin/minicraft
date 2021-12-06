'use strict';

/**
 *  edge controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::edge.edge');
