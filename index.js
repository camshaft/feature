/**
 * Module dependencies
 */

var store = require('store');
var cookie = require('cookie');
var index = require('indexof');

/**
 * Defines
 */

var KEY = 'features';

/**
 * Check if the feature is enabled
 *
 * @param {String} feature
 * @param {Boolean} ignoreCookie
 * @return {Boolean}
 * @api public
 */

exports = module.exports = function(feature, ignoreCookie) {
  var val = get()[feature];
  if (typeof val !== 'undefined' || ignoreCookie) return !!val
  return cookieValue(feature);
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

/**
 * Get the cookie value
 */

var features = (cookie(KEY) || '').split(',');

function cookieValue(feature) {
  return !!~index(features, feature);
};
