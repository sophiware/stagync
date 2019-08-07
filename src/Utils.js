import Storage from './Storage'
import deepmerge from 'deepmerge'

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

export default {
  defaultConfig (config) {
    delete config.schema
    delete config.methods

    stagyncUtilsLocalCache.defaultConfig = config
  },
  getCache (prop) {
    return prop ? stagyncUtilsLocalCache[prop] : stagyncUtilsLocalCache
  },
  createStorage (configStorage) {
    for (let key in configStorage) {
      if (configStorage[key].table) {
        configStorage[key].table = key
      }

      configStorage[key].name = key

      const storageConfig = deepmerge(stagyncUtilsLocalCache.defaultConfig, configStorage[key])
      stagyncUtilsLocalCache.storages[key] = new Storage(storageConfig)
    }
  },
  storages
}
