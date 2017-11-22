const {Model} = require('../../lib/index')

module.exports = new Model({
  database: 'stagyncTest',
  table: 'user',
  type: 'memory',
  schema: {
    username: {
      type: 'string'
    },
    active: {
      type: 'boolean'
    },
    email: {
      type: 'string'
    },
    tags: {
      type: 'array'
    },
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'number'
    },
    fullName: {
      async get () {
        const {firstName, lastName} = await this.get()
        return firstName + ' ' + lastName
      },
      listener: ['fisrtName', 'lastName']
    },
    age: {
      async get () {
        return 28
      }
    }
  }
})
