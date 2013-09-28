/**
 * Module dependencies
 */

var store = require('store');
var cookie = require('cookie');

/**
 * Defines
 */

var KEY = 'features';

/**
 * Check if the feature is enabled
 *
 * @param {String} feature
 * @return {Boolean}
 * @api public
 */

exports = module.exports = function(feature) {
  var val = get()[feature];
  return !!(typeof val === 'undefined'
    ? ~(cookie(KEY) || '').split(',').indexOf(feature)
    : val);
};

/**
 * Enable a feature
 *
 * @param {String} feature
 * @return {feature}
 * @api public
 */

exports.enable = function(feature) {
  var features = get();
  features[feature] = 1;
  set(features);
  return exports;
};

/**
 * Disable a feature
 *
 * @param {String} feature
 * @return {feature}
 * @api public
 */

exports.disable = function(feature) {
  var features = get();
  features[feature] = 0;
  set(features);
  return exports;
};

/**
 * Remove an override
 *
 * @param {String} feature
 * @return {feature}
 * @api public
 */

exports.remove = function(feature) {
  var features = get();
  delete features[feature];
  set(features);
  return exports;
};

/**
 * Get the localstorage content
 *
 * @api private
 */

function get() {
  return store(KEY) || {};
};

/**
 * Set the localstorage content
 *
 * @api private
 */

function set(value) {
  store(KEY, value);
};
