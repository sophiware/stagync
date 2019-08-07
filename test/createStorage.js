const { defaultConfig, createStorage } = require('../lib')
const Memory = require('../storages/stagync-storage-memory').default

defaultConfig({
  database: 'myDataBase',
  storage: Memory
})

createStorage({
  websites: {
    schema: {
      urls: {
        type: 'array',
        default: [
          'http://google.com',
          'http://github.com'
        ]
      },
      userProfile: {
        type: 'object'
      },
      name: {
        type: 'string'
      },
      age: {
        type: 'number',
        default: 30
      }
    },
    methods: {
      async init () {
        console.log('init')
      },
      async addAge (value) {
        const {age} = this.props
        const current = await age.get()
        await age.set(current + value)
      },
      async sortUrl () {
        const {urls} = this.props
        const list = await urls.get()
        const randomNumber = Math.floor(Math.random() * list.length)
        return list[randomNumber]
      }
    }
  }
})
