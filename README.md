# stagync
Persiste dados modelados e sincroniza, com o foco principal em frontend, web e apps baseados em javascript

# Razão
O Stagync foi criado para suprir a necessidade de controle de dados no cliente. Seu proposito é salvar e recuperar dados em SPA (single page application) e react-native, de forma global e automatica. Sendo assim, é possivél sincronizar dados em toda a aplicação baseado em uma ou diversas origem.
### Curiosidade
O nome *Stagync* vem na junção das palavras *Storage* e *Sync*

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

//... index.js
const fullName = User.get('fullName')
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
