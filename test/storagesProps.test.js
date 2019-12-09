const { storages } = require('../src')
require('./createStorage')

describe('Storage Props', () => {
  it('Website storage validate', async () => {
    if (storages.websites.name !== 'websites') {
      throw new Error('Website storage not exists')
    }
  })

  it('Get default value', async function () {
    let urls = storages.websites.props.urls.get()
    if (urls.length === 0) {
      throw new Error('Not urls')
    }
  })

  it('Set', async function () {
    storages.websites.props.name.set('test')
    const name = storages.websites.props.name.get()

    if (name !== 'test') {
      throw new Error('Set not found')
    }
  })

  it('Change value', async function () {
    const oldName = storages.websites.props.name.get()
    storages.websites.props.name.set('new')
    const newName = storages.websites.props.name.get()

    if (oldName === newName || newName !== 'new') {
      throw new Error('No change')
    }
  })

  it('Restore all props', async function () {
    const oldAge = storages.websites.props.age.get()
    storages.websites.restoreDefaultValues()
    const currentAge = storages.websites.props.age.get()

    if (oldAge === 31 && currentAge === 30) {
      throw new Error('No reset')
    }
  })

  it('Sync with started', function (done) {
    storages.websites.sync({
      age: () => {
        storages.websites.props.age.discontinue()
        done()
      }
    })
  })

  it('Sync no started', function (done) {
    storages.websites.sync({
      age (err, data) {
        storages.websites.props.age.discontinue()

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

    storages.websites.props.age.set(10)
  })

  it('Discontinue', function (done) {
    storages.websites.sync({
      name: (err, data) => done(new Error('Discontinue not work: ' + JSON.stringify(data)))
    }, false)

    const eventName = storages.websites.props.name.discontinue()

    if (!eventName) {
      return done(new Error('Discontinue not work: event not found.'))
    }

    setTimeout(done, 1)
  })

  it('Reset', async function () {
    storages.websites.props.urls.reset()

    const urls = storages.websites.props.urls.get()

    if (urls.length !== 2) {
      throw new Error('Not work add')
    }
  })

  it('Add value Object', async function () {
    storages.websites.props.profiles.set({
      nick: 'test'
    })

    storages.websites.props.profiles.add({
      username: 'user'
    })

    const profilesAdd = storages.websites.props.profiles.get()

    if (Object.keys(profilesAdd).length !== 2 || profilesAdd.username !== 'user') {
      throw new Error('Not work add')
    }
  })

  it('Add value Array', async function () {
    storages.websites.props.urls.reset()
    storages.websites.props.urls.add('http://localhost2')

    const urls = storages.websites.props.urls.get()

    if (urls.length !== 3) {
      throw new Error('Not work add')
    }
  })

  it('Extract prop', async () => {
    const { age, urls } = storages.websites.props

    await age.reset()

    age.sync((err, data) => {
      if (err) {
        throw err
      }
      console.log('sync', data)
      if (data !== 10) {
        throw new Error('age data is ' + data)
      }
    }, false)

    await age.set(10)

    const age10 = age.get()

    if (age10 !== 10) {
      throw new Error('age10')
    }

    await urls.reset()

    urls.sync((err, data) => {
      if (err) {
        throw err
      }

      if (data.length !== 3) {
        throw new Error('urls3 data')
      }
    }, false)

    await urls.add('localhost')

    const urls3 = urls.get()

    if (urls3.length !== 3) {
      throw new Error('urls3')
    }
  })
})
