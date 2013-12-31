# feature

simple client-side feature switches

## Installation

Install with [component(1)](http://component.io):

```sh
$ component install CamShaft/feature
```

## Purpose

`feature` enables developers to push features into production without acutally enabling them for everyone that comes to a site. This makes it easy to test and verify things will work be for fully releasing them. For the UI component of `feature`, check out [feature-ui](https://github.com/CamShaft/feature-ui).

## Usage

`feature` will pull in enabled values from the `features` cookie. This is the mechanism to release a feature to either everyone, or a small group. By default, all features are disabled. Any time `feature.enable` or `feature.disable` is called, it will write to localStorage, or a cookie if needed, to save overidden features locally. To use the default values again, call `feature.reset()`.

## API

### feature(name)

Check if a feature is enabled

### feature.enable(name)

Enable a feature

### feature.disable(name)

Disable a feature

### feature.remove(name)

Remove a feature from the list of local overrides

### feature.reset()

Clear the list of local overrides

### feature.watch(name, cb)

Call a function anytime a feature changes. This returns a function to stop listening:

```js
var unwatch = feature('my-cool-feature', function(enabled){
  console.log('my-cool-feature is', enabled);
});

// Stop watching the feature after 1 second
setTimeout(unwatch, 1000);
```

## feature.watchList(cb)

Call a function anytime the watch list changes. This is helpful for creating a list of available features on the fly. This returns a function to stop listening.

## Example

```js
var feature = require('feature');

// Check if a feature is enabled
feature('my-cool-feature'); // false

// Enable a feature
feature.enable('my-cool-feature');

// Check it again
feature('my-cool-feature'); // true

// Disable it
feature.disable('my-cool-feature');

// Check it again
feature('my-cool-feature'); // false

// Reset local copy of enabled features
feature.reset();
```

## License

  MIT
