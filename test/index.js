
var User = require('./models/user')

const handler = async () => {
  console.log('----set 1----')
  await User.set({firstName: Date.now()})

  console.log('----get 1----')
  const data1 = await User.get()
  console.log('data1', data1)

  console.log('----merge 2----')
  await User.set({lastName: `${Date.now()}@email.com`})

  console.log('----get 2 ----')
  const data2 = await User.get()
  console.log('data2', data2)

  console.log('----virtualProps ----')
  const data3 = await User.get('fullName')
  console.log(data3)

  console.log('----getVirtualProps ----')
  const data4 = await User.getVirtualProps()
  console.log(data4)
}

handler()
