const localCache = {}

export default class GenericDrive {
  removeItem (item) {
    if (localCache[item]) {
      delete localCache[item]
    }

    return true
  }

  getItem (item) {
    return localCache[item] || null
  }

  setItem (item, value) {
    if (!localCache[item]) {
      localCache[item] = value
    } else {
      for (let key in value) {
        localCache[item][key] = value[key]
      }
    }

    return localCache[item]
  }

  clear () {
    for (let key in localCache) {
      delete localCache[key]
    }

    return true
  }
}
