const { storages } = require('../src')
require('./createStorage')

describe('Storage', () => {
  it('Website storage validate', async () => {
    if (storages.websites.name !== 'websites') {
      throw new Error('Website storage not exists')
    }
  })

  it('Get default value', async () => {
    let urls = storages.websites.get('urls')
    if (urls.length === 0) {
      throw new Error('Not urls')
    }
  })

  it('Set', async () => {
    storages.websites.set({ name: 'test' })
    const name = storages.websites.get('name')

    if (name !== 'test') {
      throw new Error('Set not found')
    }
  })

  it('Change value', async () => {
    const oldName = storages.websites.get('name')
    storages.websites.set({ name: 'new' })
    const newName = storages.websites.get('name')

    if (oldName === newName || newName !== 'new') {
      throw new Error('No change')
    }
  })

  it('Restore all props', async () => {
    const oldAge = storages.websites.get('age')
    storages.websites.restoreDefaultValues()
    const currentAge = storages.websites.get('age')

    if (oldAge === 31 && currentAge === 30) {
      throw new Error('No reset')
    }
  })

  it('Sync with started', function (done) {
    storages.websites.sync({
      age: () => {
        storages.websites.discontinue('age')
        done()
      }
    })
  })

  it('Sync no started', function (done) {
    storages.websites.sync({
      age (err, data) {
        storages.websites.discontinue('age')

        if (err) {
          return done(err)
        }

        if (data === 10) {
          return done()
        } else {
          done(new Error('No sync'))
        }
      }
    }, false)

    storages.websites.set({
      age: 10
    })
  })

  it('Sync many', function (done) {
    storages.websites.syncMany(['age', 'name'], (err, data) => {
      storages.websites.discontinue('age')
      storages.websites.discontinue('name')
      if (err) {
        return done(err)
      }

      if ('name' in data && data.name === 'okok') {
        return done()
      } else {
        done(new Error('No sync many'))
      }
    }, false)

    storages.websites.set({
      name: 'okok'
    })
  })

  it('Sync all', function (done) {
    storages.websites.syncAll((err, data) => {
      storages.websites.discontinueAll()

      if (err) {
        return done(err)
      }

      if (data.name === 'itsis') {
        return done()
      } else {
        done(new Error('No sync many'))
      }
    }, false)

    storages.websites.set({
      name: 'itsis'
    })
  })

  it('Discontinue', function (done) {
    storages.websites.sync({
      name: (err, data) => done(new Error('Discontinue not work: ' + JSON.stringify(data)))
    }, false)

    const eventName = storages.websites.discontinue('name')

    if (!eventName) {
      return done(new Error('Discontinue not work: event not found.'))
    }

    setTimeout(done, 1)
  })

  it('Discontinue All', function (done) {
    storages.websites.sync({
      name: (err, data) => {
        storages.websites.discontinue('name')
        done(new Error('Discontinue not work: name ' + JSON.stringify(data)))
      },
      age: (err, data) => {
        storages.websites.discontinue('age')
        done(new Error('Discontinue not work: age ' + JSON.stringify(data)))
      }
    }, false)

    const removed = storages.websites.discontinueAll()

    if (removed.length !== 2) {
      return done(new Error('Discontinue not work'))
    }

    storages.websites.set({
      name: 'itsis'
    })

    storages.websites.set({
      age: 3
    })

    setTimeout(done, 1)
  })

  it('Scope', () => new Promise((resolve, reject) => {
    const scopeSuccess = storages.websites.scope()
    const scopeFail = storages.websites.scope()

    scopeSuccess.sync({
      name: resolve
    }, false)

    scopeFail.sync({
      name: reject
    }, false)

    scopeFail.discontinueAll()

    scopeFail.set({
      name: 'testname'
    })
  }))

  it('Discontinue Global Scopes', () => new Promise((resolve, reject) => {
    const scopeSuccess = storages.websites.scope()
    const scopeFail = storages.websites.scope()

    scopeSuccess.sync({
      name: reject
    }, false)

    scopeFail.sync({
      name: reject
    }, false)

    storages.websites.discontinueGlobalAll()

    scopeFail.set({
      name: 'testname'
    })

    setTimeout(resolve, 10)
  }))

  it('Scopes Friendly', () => new Promise((resolve, reject) => {
    const scopeSuccess = storages.scope.success.websites
    const scopeFail = storages.scope.fail.websites

    scopeSuccess.sync({
      name: reject
    }, false)

    scopeFail.sync({
      name: reject
    }, false)

    storages.websites.discontinueGlobalAll()

    scopeFail.set({
      name: 'testname'
    })

    setTimeout(resolve, 10)
  }))

  it('Still', () => new Promise((resolve, reject) => {
    storages.websites.syncAll((err, data) => {
      if (err) {
        return reject(err)
      }

      if (data.name === 'listener') {
        return resolve()
      }

      reject(new Error('Not Work'))
    })

    storages.websites.still().set({
      name: 'still!'
    })

    storages.websites.set({
      name: 'listener'
    })

    setTimeout(() => reject('Not work'), 0)
  }))
})
