# stagync
Persiste dados modelados e sincroniza, com o foco principal em frontend, web e apps baseados em javascript

# Razão
O Stagync foi criado para suprir a necessidade de controle de dados no cliente. Seu proposito é salvar e recuperar dados em SPA (single page application) e react-native, de forma global e automatica. Sendo assim, é possivél sincronizar dados em toda a aplicação baseado em uma ou diversas origem.
### Curiosidade
O nome *Stagync* vem na junção das palavras *Storage* e *Sync*

## Exemplo de uso
./src/app.js
```javascript
import User from './Storages/user'

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


# stagync-storage
Stagync does not work alone. To use it you need a * stagync-storage *. Stagync-storage are plugins that connect your data model to a storage location.

## Example
### [stagync-storage-memory](https://github.com/sophiware/stagync-storage-memory)
You persist the data in memory. That is, a global variable is created by persisting in it the saved data.

### [stagync-storage-native-async-storage](https://github.com/sophiware/stagync-storage-memory)
You persist data using [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html)

### [stagync-storage-localforage](https://github.com/sophiware/stagync-storage-localforage) 
You persist data using [LocalForage](https://github.com/localForage/localForage)

# Instalação
```bash
  npm install --save stagync stagync-storage-memory
```

# Storage
Storage defines persistence type, table name, database name, schema, and additional methods.
Through a data storage you can manage specific data in your application.

## Example
./src/Storages/user.js
```javascript
import { Storage } from 'stagync'
import Memory  from 'stagync-storage-memory'

export default new Storage({
  database: 'myDataBase',
  table: 'user',
  storage: Memory,
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

## database
Name of your database
```javascript
database: 'myDataBase'
```

## table
Data table name
```javascript
table: 'user'
```

## storage
Type of storage. Here you will need a [*stagync-storage*](#stagync-storage) to connect your data model to a storage location.

```javascript
import Memory  from 'stagync-storage-memory'

export default new Model({
  // ...
  storage: Memory
  // ...
}
```

## schema
Data schema. You need to define a data schema for your model, data not defined in the schema will return with error when you try to add them.

Each data property can receive the following attributes:
 - **type**: Definição de typo de dado, possibilidades:
 - - string
 - - number
 - - boolean
 - - array
 - - object
 - - function
 - - xml
 - **default**: Default value of the property.
 - **get**: Define that the declared property is a [virtual prop](#virtual-props)
 - **listener** Quando a propriedade é uma *virtual prop*, a propriedade escuta os valores de listener e emitir sincronismo quando esses valores são modificados, veja [lisneter](#listener)
 - **listener** When the property is a * virtual * property, the property listens for the listener values and emits synchronization when those values are modified, see [lisneter](#listener)
 
 ## methods
Additional methods that can be called with your model
```javascript
 methods: {
     loginUser(){
       const { username, password } = await this.get()

       try{
         const token = await rest.post('user/login', { username, password })
         this.set({ token })

       } catch (err) {
         if(err.statusCode === 401)
         alert('Usuário ou senha inválidos.')
       }
     }
 }
 ```

 ### Example
```javascript
schema: {
  age: {
    type: 'number',
    default: 28
  },
  name: {
    type: 'string'
  },
  nameAge { // Virtual Prop
    get(){
      const { name, age } = this.get()
      return `${name} com ${age}`
    },
    listener: ['name', 'age']
  }
```

## Virtual props
Define properties that execute a function. This function can return treated properties or any other value, and can be asynchronous or synchronous.

```javascript
//... models/user.js
fullName: { // Virtual prop
  async get () {
    const {firstName, lastName} = await this.get()
    return firstName + ' ' + lastName
  },
  listener: ['fisrtName', 'lastName']
}

index.index.jsxt fullName = User.get('fullName')
console.log(fullName) // Philippe Assis
```

#### listener
Array with the name of the dependent property. When listener is set to a virtual property this property emits an event for synchronization when the properties defined in listener are updated.

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

# Metodos
## Setter and Getter
### set(props)
Adds data by an object to storage

```javascript
User.set({
  nickname: 'Assis',
  tags: ['Brazil', 'Dev']
})
```
### get(prop)
Recover data from storage.

```javascript
const {nickname, tags} = await User.get()
```
You can specify the property to retrieve.

```javascript
const data = await User.get('nickname')
```

### merge
Merge new data with data already saved.

```javascript
User.merge({
  active: false
})

/*
Result:
{
  "nickiname": "Assis",
  "tags": ['Brazil', 'Dev'],
  "active": false
}
*/
```

## Synchronizers
### sync(props)
Synchronizes properties defined on an object by executing a callback every time the property is updated.

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
Synchronizes all properties by performing a callback with each update and passing only the updated property.
```javascript
User.syncAll((err, data) {
  //...
})
```
### syncMany(props, callback)
Synchronizes all the properties passed in an array by executing a callback every time the property is updated.
```javascript
User.syncMany(['nickname', 'tags'], (err, data) {
  //...
})
```

## clear()
Clears the entire table
```javascript
User.clear()
```

## restoreDefaultValues()
Restores the data to the default values registered in the schema
```javascript
User.restoreDefaultValues()
```
# Stagync with Webpack
When using Stagync with Webpack, you should not set the type of storage with * type *. Instead, you must directly import the storage library and set in the ** storage ** property.
Otherwise the webpack will not be able to perform the * require * in the plugin. Making it common to display the error: `Can not find module '." `

```javascript
import { Storage } from 'stagync'
import Memory from 'stagync-storage-memory' // Import lib

export default new Storage({
  database: 'myDataBase',
  table: 'user',
  storage: Memory, // Include lib
```
