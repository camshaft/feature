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
  var features = get();
  var enabled = features[feature];
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
  features[feature] = true;
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
  features[feature] = false;
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
  set(null);
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
 * Keep a cached version of the enabled features
 */

var cache;

/**
 * Get the localstorage content
 *
 * @api private
 */

function get() {
  if (cache) return cache;
  var value = store.supported
    ? store(exports.KEY)
    : cookie('_' + exports.KEY);
  cache = decode(value);
  return cache;
}

/**
 * Set the localstorage content
 *
 * @api private
 */

function set(value) {
  var encoded = encode(value);
  store.supported
    ? store(exports.KEY, encoded)
    : cookie('_' + exports.KEY, encoded);
  cache = value;
}

/**
 * Encode enabled values in small format
 */

function encode(obj) {
  if (!obj) return obj;
  var str = '';
  each(obj, function(key, value) {
    str = str + (value ? '*' : '!') + key;
  });
  return str;
}

/**
 * Decode enabled values from a small format
 */

function decode(str) {
  var obj = {};
  if (!str || !str.split) return obj;
  var list = str.split(/([!\*])/);
  // Remove the first space if it's ""
  if (list[0] === '') list.shift();
  for (var i = 0; i < list.length; i += 2) {
    obj[list[i + 1]] = list[i] === '*';
  };
  return obj;
}

/**
 * Get the cookie value
 */

function cookieValue(feature) {
  var features = (cookie(exports.KEY) || '').split(',');
  return !!~index(features, feature);
}
