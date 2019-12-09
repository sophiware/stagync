const Storage = require('./Storage.js')
const utils = require('./utils.js')

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
