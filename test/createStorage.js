const { defaultConfig, createStorage } = require('../lib')
const Memory = require('@stagync-driver/memory').default

defaultConfig({
  database: 'myDataBase',
  driver: Memory
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
      profiles: {
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
