# stagync
Persiste dados modelados e sincroniza, com o foco principal em frontend, web e apps baseados em javascript

# Schema
Exemplo de um Model
```javascript
// models/user.js
import { Model } from 'stagync'

export default new Model({
  database: 'myDataBases',
  table: 'user',
  type: 'memory',
  schema: {
    age: {
      type: 'number'
    },
    active: {
      type: 'boolean',
      default: true
    },
    tags: {
      type: 'array'
    },
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
    fullName: { // Virtual prop
      async get () {
        const {firstName, lastName} = await this.get()
        return firstName + ' ' + lastName
      },
      listener: ['fisrtName', 'lastName']
    },
    nickname: { // Virtual prop
      get () {
        return 'assis'
      }
    }
  },
  methods: {
    getNames(){
      const { nickname, firstName, lastName, fullName } = await this.get()
      return { nickname, firstName, lastName, fullName }
    }
  }
})
```

## Exemplo de uso
```javascript
import User from './models/user'

const handler = async () => {
  User.sync({
    fullName (err, data) {
      if (err) {
        throw err.message
      }

      console.log('sync fullName:', data)
    }
  })

  User.set({
    firstName: 'Philippe',
    lastName: 'Assis'
  })

  const { fullName, fistName } = await User.get()

  console.log(fullName, fistName)
}

handler()
```

## Virtual props
Defini propriedades que executam uma função retornando um valor combinado ou outro.
```javascript
//... models/user.js
fullName: { // Virtual prop
  async get () {
    const {firstName, lastName} = await this.get()
    return firstName + ' ' + lastName
  },
  listener: ['fisrtName', 'lastName']
}

//... index.js
const fullName = User.get('fullName')
console.log(fullName) // Philippe Assis
```
#### listener
Array com o o nome das propriedade dependente. Quano listener é definido em uma propriedade virtual essa propriedade emit um evento para sincronização quando as propriedades definidas em listener são atualizadas
```javascript
//...
User.sync({
  fullName(err, data){
    // data is Martin Assis
  }
})

User.set({ fistName: 'Martin' })
//..
```

## Setter and Getter
### set(props)
Adiciona dados por um objeto ao storage
```javascript
User.set({
  nickname: 'Assis',
  tags: ['Brazil', 'Dev']
})
```
### get(prop)
Recupera dados dos storage
```javascript
const {nickname, tags} = await User.get()
```
Você pode especificar a propriedade a ser recuperada
```javascript
const data = await User.get('nickname')
```

## Sincronizadores
### sync(props)
Sincroniza propriedades definidas em um objecto executando um callback toda vez em que a propriedade for atualizada
```javascript
User.sync({
  nickname (err, data) {
    //...
  },
  tags (err, data) {
    //...
  },
})
```
### syncAll(callback)
Sincroniza todas as propriedades executando um callback a cada atualização e passando somente a propriedade atualizada
```javascript
User.syncAll((err, data) {
  //...
})
```
### syncMany(props, callback)
Sincroniza todas as propriedades passadas em um array executando um callback toda vez em que a propriedade for atualizada
```javascript
User.syncMany(['nickname', 'tags'], (err, data) {
  //...
})
```

### clear()
Limpa toda a tabela
```javascript
User.clear()
```
