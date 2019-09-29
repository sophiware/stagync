const localCache = {}

export default class Memory {
  removeItem (item, callback) {
    try {
      if (localCache[item]) {
        delete localCache[item]
      }

      if (callback) {
        return callback(null, true)
      }
    } catch (err) {
      return callback(err)
    }
  }

  getItem (item, callback) {
    try {
      return callback(null, localCache[item] || null)
    } catch (err) {
      return callback(err)
    }
  }

  setItem (item, value, callback) {
    try {
      if (!localCache[item]) {
        localCache[item] = value
      } else {
        for (let key in value) {
          localCache[item][key] = value[key]
        }
      }

      callback(null, localCache[item])
    } catch (err) {
      return callback(err)
    }
  }

  clear (callback) {
    try {
      for (let key in localCache) {
        delete localCache[key]
      }

      callback(null, true)
    } catch (err) {
      callback(err)
    }
  }
}
