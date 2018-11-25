export default class Util {
  constructor (storage) {
    this.storage = storage
  }

  static setStorage (storage) {
    return new Util(storage)
  }

  getWhenDone (...items) {
    const that = this

    return new Promise((resolve, reject) => {
      that.storage.syncAll((err, data) => {
        if (err) {
          return console.log(err)
        }

        that.storage.get().then(data => {
          if (data) {
            const keys = Object.keys(data)
            if (items.every(el => keys.indexOf(el) > -1)) {
              resolve(data)
            }
          }
        })
      })
    })
  }
}
