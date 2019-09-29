const Memory = require('../browser')
const driver = new Memory()

describe('Storage', () => {
  const driverKey = '@test:123'

  it('Set item', function (done) {
    driver.setItem(driverKey, {name: 'it'}, (err, value) => {
      if (err) {
        return done(err)
      }

      if (value.name === 'it') {
        return done()
      }

      done(new Error('Not work Set'))
    })
  })

  it('Get item', function (done) {
    driver.setItem(driverKey, {name: 'ok'}, (err) => {
      if (err) {
        return done(new Error('No work Set'))
      }

      driver.getItem(driverKey, (err, value) => {
        if (err) {
          return done(new Error('No work Get'))
        }

        if (value.name === 'ok') {
          return done()
        }

        done(new Error('No work Get'))
      })
    })
  })

  it('Remove item', function (done) {
    driver.setItem(driverKey, {name: 'it'}, (err) => {
      if (err) {
        return done(new Error('No work Set'))
      }

      driver.removeItem(driverKey, (err) => {
        if (err) {
          return done(new Error('No work Remove'))
        }

        driver.getItem(driverKey, (err, value) => {
          if (err) {
            return done(new Error('No work Get'))
          }

          if (value === null) {
            return done()
          }

          done(new Error('No work Get'))
        })
      })
    })
  })

  it('Clear storage', function (done) {
    driver.setItem(driverKey, {name: 'it'}, (err) => {
      if (err) {
        return done(new Error('No work Set'))
      }

      driver.clear(() => {
        if (err) {
          return done(new Error('No work Clear'))
        }

        driver.getItem(driverKey, (err, value) => {
          if (err) {
            return done(new Error('No work Get'))
          }

          if (value === null) {
            return done()
          }

          done(new Error('No work Get'))
        })
      })
    })
  })

  it('Multiple Set item', function (done) {
    driver.setItem(driverKey, {name: 'it', age: 33, list: ['ok', 'no', 'yes']}, (err, value) => {
      if (err) {
        return done(err)
      }

      if (value.name === 'it' && value.age === 33 && value.list[0] === 'ok') {
        return done()
      }

      done(new Error('Not work Set'))
    })
  })
})
