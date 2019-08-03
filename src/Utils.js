import StorageProps from './StorageProps'
import deepmerge from 'deepmerge'

const stagyncUtilsLocalCache = {
  defaultConfig: {},
  storages: {}
}

const storages = new Proxy({}, {
  get: function (target, name) {
    return stagyncUtilsLocalCache.storages[name]
  }
})

export default {
  defaultConfig (config) {
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
      stagyncUtilsLocalCache.storages[key] = new StorageProps(storageConfig)
    }
  },
  storages
}
