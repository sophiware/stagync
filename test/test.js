var assert = require('assert')
var User = require('./models/user')

describe('Storage User', function () {
  describe('#get()', function () {
    it('get', function () {
      User.get().then(data => console.log(data))
      assert.equal(-1, [1, 2, 3].indexOf(4))
    })
  })
})
