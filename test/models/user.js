const {Model} = require('../../lib/index')

module.exports = new Model({
  database: 'ceadercoor',
  table: 'user',
  type: 'memory',
  schema: {
    username: {
      type: String
    },
    nickname: {
      type: String
    },
    email: {
      type: String
    },
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    fullName: {
      async get () {
        const {firstName, lastName} = await this.get()
        return firstName + ' - ' + lastName
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
