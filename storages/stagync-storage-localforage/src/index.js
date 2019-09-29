import localforage from 'localforage'

export default class Localstorage {
  constructor (parent) {
    const driver = ('localForageDriver' in parent.config) ? parent.config.localForageDriver.toUpperCase() : 'LOCALSTORAGE'

    this.local = localforage

    this.local.config({
      driver: localforage[driver],
      name: parent.database
    })
  }

  removeItem (item, callback) {
    return this.local.removeItem(item, callback)
  }

  getItem (item, callback) {
    return this.local.getItem(item, callback)
  }

  setItem (item, value, callback) {
    const that = this

    return this.local.getItem(item, (err, data) => {
      if (err) {
        throw err
      }

      if (data !== null && typeof data === 'object') {
        const obj = data

        Object.keys(value).map(key => {
          obj[key] = value[key]
        })

        return that.local.setItem(item, obj, callback)
      }

      that.local.setItem(item, value, callback)
    })
  }

  clear (callback) {
    return this.local.clear(callback)
  }
}
