const Storage = require('./Storage.js').default
const utils = require('./utils.js').default

const storages = utils.storages
const createStorage = utils.createStorage
const defaultConfig = utils.defaultConfig

module.exports = {
  Storage,
  utils,
  storages,
  createStorage,
  defaultConfig
}
