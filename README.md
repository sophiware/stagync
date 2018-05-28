# stagync
Persiste dados modelados e sincroniza, com o foco principal em frontend, web e apps baseados em javascript

# Razão
O Stagync foi criado para suprir a necessidade de controle de dados no cliente. Seu proposito é salvar e recuperar dados em SPA (single page application) e react-native, de forma global e automatica. Sendo assim, é possivél sincronizar dados em toda a aplicação baseado em uma ou diversas origem.
### Curiosidade
O nome *Stagync* vem na junção das palavras *Storage* e *Sync*

## Exemplo de uso
./src/app.js
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


# stagync-storage
O Stagync não funciona sozinho. Para ultilizalo você precisa de um *stagync-storage*. Os stagync-storage são plugins que conectão o seu modelo de dados a um local de armazenamento.

## Exemplo
### [stagync-storage-memory](https://github.com/sophiware/stagync-storage-memory)
Persistes os dados em memoria. Ou seja, uma variavel global é criada persistindo nela os dados salvos.

### [stagync-storage-native-async-storage](https://github.com/sophiware/stagync-storage-memory) (A fazer)
Persistes dados ultilizando [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html)

### [stagync-storage-localstorage](https://github.com/sophiware/stagync-storage-localstorage) (A fazer)
Persistes os dados no local storage do navegador.

### [stagync-storage-cookie](https://github.com/sophiware/stagync-storage-cookie) (A fazer)
Persistes os dados em cookies para navegadores

### [stagync-storage-session](https://github.com/sophiware/stagync-storage-session) (A fazer)
Persistes os dados em sessão para navegadores

# Instalação
```bash
  npm install --save stagync stagync-storage-memory
```

# Model
Os modelos de dados definem tipo de persistencia, nome da table, nome do banco de dados, esquema e metodos adicionais.
Através de um modelo de dados você pode gerir dados especificos em sua aplicação.

## Exemplo
./src/models/user.js
```javascript
import { Model } from 'stagync'
import Memory  from 'stagync-storage-memory'

export default new Model({
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
Nome do seu banco de dados
```javascript
database: 'myDataBase'
```

## table
Nome da tabela de dados
```javascript
table: 'user'
```

## storage
Tipo de armazenamento. Aqui você precisará de um [*stagync-storage*](#stagync-storage) para conectar seu modelo de dados a um local de armazenamento.
```javascript
import Memory  from 'stagync-storage-memory'

export default new Model({
  // ...
  storage: Memory
  // ...
}
```

## schema
Esquema de dados. Você precisa definir um esquema de dados para seu modelo, dados não definidos no schema retorarão com erro ao tentar adiciona-los.

Cada propriedade de dados podem receber os seguinte atributos:
 - **type**: Definição de typo de dado, possibilidades:
 - - string
 - - number
 - - boolean
 - - array
 - - object
 - - function
 - - xml
 - **default**: Valor padrão da propriedade.
 - **get**: Defini que a propriedade declarada é uma [virtual prop](#virtual-props)
 - **listener** Quando a propriedade é uma *virtual prop*, a propriedade escuta os valores de listener e emitir sincronismo quando esses valores são modificados, veja [lisneter](#listener)

 ## methods
 Metodos adicionas que poderão ser chamados com seu model
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

 ### Exemplo
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
Defini propriedades que executam uma função. Essa função pode retornar propriedaes tratadas ou qualquer outro valor, podendo ser assíncrona ou sincrona.
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
Array com o o nome das propriedade dependente. Quando listener é definido em uma propriedade virtual essa propriedade emit um evento para sincronização quando as propriedades definidas em listener são atualizadas
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

### merge
Mescla novos dados com dados já salvos
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

## clear()
Limpa toda a tabela
```javascript
User.clear()
```
# Stagync com Webpack
Ao ultilizar Stagync com Webpack, você não deve definir o tipo de armazenamento com *type*. Ao invés disso, você deve importar diretamente a biblioteca do storage e definir em na propriedade **storage**.
Caso contrário o webpack não conseguirá realizar o *require* no plugin. Tornando-se comum a exibição do erro: `Cannot find module "."`

```javascript
import { Model } from 'stagync'
import Memory from 'stagync-storage-memory' // Import lib

export default new Model({
  database: 'myDataBase',
  table: 'user',
  storage: Memory, // Include lib
```
