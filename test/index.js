
var User = require('./models/user')

const handler = async () => {
  console.log('----syncAll----')
  User.syncAll((err, data) => {
    if (err) {
      throw err.message
    }

    console.log('syncAll', data)
  })

  console.log('----syncAll----')
  User.syncMany(['firstName', 'email'], (err, data) => {
    if (err) {
      throw err.message
    }

    console.log('syncMany', data)
  })

  console.log('----sync----')
  User.sync({
    firstName: (err, data) => {
      if (err) {
        throw err.message
      }

      console.log('syncFirstName', data)
    },
    fullName: (err, data) => {
      if (err) {
        throw err.message
      }

      console.log('syncFullName', data)
    }
  })

  console.log('----set----')
  await User.set({firstName: Date.now().toString()})
  await User.set({lastName: Date.now()})
  await User.set({tags: [1, 2, 3, 4]})

  console.log('----get----')
  const data6 = await User.get()
  console.log(data6)
}

handler()
