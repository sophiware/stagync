"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Storage = _interopRequireDefault(require("./Storage"));

var _deepmerge = _interopRequireDefault(require("deepmerge"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stagyncUtilsLocalCache = {
  defaultConfig: {},
  storages: {},
  scopes: {}
};
var scopesHandler = new Proxy({}, {
  get: function get(target, scopeName) {
    if (!stagyncUtilsLocalCache.scopes[scopeName]) {
      stagyncUtilsLocalCache.scopes[scopeName] = {};
    }

    return new Proxy({}, {
      get: function get(target, storageName) {
        if (!stagyncUtilsLocalCache.scopes[scopeName][storageName]) {
          stagyncUtilsLocalCache.scopes[scopeName][storageName] = stagyncUtilsLocalCache.storages[storageName].scope();
        }

        return stagyncUtilsLocalCache.scopes[scopeName][storageName];
      }
    });
  }
});
var storages = new Proxy({}, {
  get: function get(target, name) {
    if (name === 'scope') {
      return scopesHandler;
    }

    return stagyncUtilsLocalCache.storages[name];
  }
});
var _default = {
  defaultConfig: function defaultConfig(config) {
    delete config.schema;
    delete config.methods;
    stagyncUtilsLocalCache.defaultConfig = config;
  },
  getCache: function getCache(prop) {
    return prop ? stagyncUtilsLocalCache[prop] : stagyncUtilsLocalCache;
  },
  createStorage: function createStorage(configStorage) {
    var inits = [];

    var _loop = function _loop(key) {
      if (configStorage[key].table) {
        configStorage[key].table = key;
      }

      configStorage[key].name = key;
      inits.push(new Promise(function (resolve) {
        if (!configStorage[key].methods) {
          configStorage[key].methods = {};
        }

        configStorage[key].methods._init = resolve;
        var storageConfig = (0, _deepmerge.default)(stagyncUtilsLocalCache.defaultConfig, configStorage[key]);
        stagyncUtilsLocalCache.storages[key] = new _Storage.default(storageConfig);
      }));
    };

    for (var key in configStorage) {
      _loop(key);
    }

    return function () {
      return Promise.all(inits);
    };
  },
  storages: storages
};
exports.default = _default;