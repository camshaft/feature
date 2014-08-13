/**
 * Module dependencies
 */

var store = require('store');
var cookie = require('cookie');
var index = require('indexof');
var each = require('each');
var select = require('select');
var keys = require('keys');
var Emitter = require('emitter');

/**
 * Create an emitter
 */

var emitter = new Emitter;

/**
 * Create a list emitter
 */

var listEmitter = new Emitter;

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
 * Set a feature value
 *
 * @param {String} feature
 * @param {String} value
 * @return {feature}
 * @api public
 */

exports.set = function(feature, value) {
  var features = get();
  features[feature] = value;
  set(features);
  emitter.emit(feature, value);
  return exports;
};

/**
 * Enable a feature
 *
 * @param {String} feature
 * @return {feature}
 * @api public
 */

exports.enable = function(feature) {
  return exports.set(feature, true);
};

/**
 * Disable a feature
 *
 * @param {String} feature
 * @return {feature}
 * @api public
 */

exports.disable = function(feature) {
  return exports.set(feature, false);
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
 * @param {String?} variant
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

exports.watch = function(feature, variant, fn) {
  if (typeof variant === 'function') {
    fn = variant;
    variant = true;
  }
  fn._variant = variant;
  var listHasChanged = !emitter.hasListeners(feature);
  emitter.on(feature, fn);
  fn(exports(feature));
  if (listHasChanged) notify();
  return function() {
    emitter.off(feature, fn);
    if (!emitter.hasListeners(feature)) notify();
  };

  function notify() {
    listEmitter.emit('change', exports.list());
  }
};

/**
 * Lists the current watchers
 */

exports.list = function() {
  if (!emitter._callbacks) return [];
  var _callbacks = emitter._callbacks;
  return select(keys(_callbacks), function(feature) {
    return !!_callbacks[feature].length;
  });
};

/**
 * List the options for a feature
 */

exports.options = function(feature) {
  var subs = emitter._callbacks[feature];
  var opts = [];
  each(subs, function(sub) {
    var v = sub._variant;
    if (!~opts.indexOf(v)) opts.push(v);
  });
  return opts;
};

/**
 * Watch the watchers list
 */

exports.watchList = function(fn) {
  listEmitter.on('change', fn);
  fn(exports.list());
  return function() {
    listEmitter.off('change', fn);
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
    str += (typeof value === 'boolean' ?
      (value ? '*' : '!') :
      ('*' + value + '|')) + key;
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
    var key = list[i + 1];
    var parts = key.split('|');
    if (parts.length === 1) {
      obj[key] = list[i] === '*';
    } else {
      obj[parts[1]] = parts[0];
    }
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
