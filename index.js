/**
 * Module dependencies
 */

var store = require('store');
var cookie = require('cookie');
var index = require('indexof');
var each = require('each');
var Emitter = require('emitter');

/**
 * Create an emitter
 */

var emitter = new Emitter;

/**
 * Check if the feature is enabled
 *
 * @param {String} feature
 * @param {Boolean} ignoreCookie
 * @return {Boolean}
 * @api public
 */

exports = module.exports = function(feature, ignoreCookie) {
  var enabled = get()[feature];
  if (typeof enabled !== 'undefined' || ignoreCookie) return !!enabled;
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
  emitter.emit(feature, true);
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
  emitter.emit(feature, false);
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
  emitter.emit(feature, exports(feature));
  return exports;
};

/**
 * Reset the overridden features
 *
 * @return {feature}
 * @api public
 */

exports.reset = function() {
  store(null);
  each(emitter._callbacks, function(feature) {
    emitter.emit(feature, exports(feature));
  });
  return exports;
};

/**
 * Watch for any changes
 *
 * @param {String} feature
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

exports.watch = function(feature, fn) {
  emitter.on(feature, fn);
  fn(exports(feature));
  return function() {
    emitter.off(feature, fn);
  };
};

/**
 * Expose the cookie/localstorage keys
 */

exports.KEY = 'features';

/**
 * Get the localstorage content
 *
 * @api private
 */

function get() {
  if (!store.supported) return {};
  return store(exports.KEY) || {};
};

/**
 * Set the localstorage content
 *
 * @api private
 */

function set(value) {
  if (!store.supported) return;
  store(exports.KEY, value);
};

/**
 * Get the cookie value
 */

function cookieValue(feature) {
  var features = (cookie(exports.KEY) || '').split(',');
  return !!~index(features, feature);
};
