export default class Util {
  constructor (model) {
    this.model = model
  }

  static setModel (model) {
    return new Util(model)
  }

  getWhenDone (...items) {
    const that = this

    return new Promise((resolve, reject) => {
      that.model.syncAll((err, data) => {
        if (err) {
          return console.log(err)
        }

        that.model.get().then(data => {
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
