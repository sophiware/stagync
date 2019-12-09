const Storage = require('./Storage').default
const deepmerge = require('deepmerge').default

const stagyncUtilsLocalCache = {
  defaultConfig: {},
  storages: {},
  scopes: {}
}

const scopesHandler = new Proxy({}, {
  get: function (target, scopeName) {
    if (!stagyncUtilsLocalCache.scopes[scopeName]) {
      stagyncUtilsLocalCache.scopes[scopeName] = {}
    }

    return new Proxy({}, {
      get: function (target, storageName) {
        if (!stagyncUtilsLocalCache.scopes[scopeName][storageName]) {
          stagyncUtilsLocalCache.scopes[scopeName][storageName] = stagyncUtilsLocalCache.storages[storageName].scope()
        }

        return stagyncUtilsLocalCache.scopes[scopeName][storageName]
      }
    })
  }
})

const storages = new Proxy({}, {
  get: function (target, name) {
    if (name === 'scope') {
      return scopesHandler
    }

    return stagyncUtilsLocalCache.storages[name]
  }
})

module.exports.default = {
  defaultConfig (config) {
    delete config.schema
    delete config.methods

    stagyncUtilsLocalCache.defaultConfig = config
  },
  getCache (prop) {
    return prop ? stagyncUtilsLocalCache[prop] : stagyncUtilsLocalCache
  },
  createStorage (configStorage) {
    const inits = []

    for (let key in configStorage) {
      if (configStorage[key].table) {
        configStorage[key].table = key
      }

      configStorage[key].name = key
      inits.push(new Promise(resolve => {
        if (!configStorage[key].methods) {
          configStorage[key].methods = {}
        }
        configStorage[key].methods._init = resolve

        const storageConfig = deepmerge(stagyncUtilsLocalCache.defaultConfig, configStorage[key])
        stagyncUtilsLocalCache.storages[key] = new Storage(storageConfig)
      }))
    }

    return () => Promise.all(inits)
  },
  storages
}
