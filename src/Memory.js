const localCache = {}

module.exports.default = class Memory {
  removeItem (item, callback) {
    if (localCache[item]) {
      delete localCache[item]
    }

    if (callback) {
      return callback()
    }

    return true
  }

  getItem (item, callback) {
    if (callback) {
      return callback(null, localCache[item] || null)
    }

    return localCache[item] || null
  }

  setItem (item, value, callback) {
    if (!localCache[item]) {
      localCache[item] = value
    } else {
      for (let key in value) {
        localCache[item][key] = value[key]
      }
    }

    if (callback) {
      return callback(null, localCache[item])
    }

    return localCache[item]
  }

  clear (callback) {
    for (let key in localCache) {
      delete localCache[key]
    }

    if (callback) {
      return callback()
    }

    return true
  }
}
