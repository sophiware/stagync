import 'babel-polyfill'
import EventEmitter from 'events'
import deepmerge from 'deepmerge'
import clone from 'clone'

const eventEmitter = new EventEmitter()

export default class Model {
  constructor (config) {
    this._prepareVars(config)
    this._importStorage()
    this._prepareMethods()
    this._prepareVirtualProps()
    this._prepareSchema()

    // Caso tenha definido init em methods
    if (this.init) {
      this.init()
    }
  }

  _importStorage () {
    if (!this.config.storage) {
      throw new Error('You need to define a storage for this model. Learn how at https://github.com/sophiware/stagync#storage')
    }

    try {
      this.storage = new this.config.storage(this)
    } catch (err) {
      throw new Error('An error occurred while trying to load storage', err)
    }
  }

  _prepareVars (config) {
    this.config = config
    this.database = config.database
    this.table = config.table
    this.methods = config.methods || null
    this.key = `@${this.database}:${this.table}`
    this.prefixNameEvent = `${this.key}:`
    this.schema = config.schema || null
    this.type = config.type || null
    this.eventsNames = []
    this.virtualProps = {}
    this.stillEmitter = config.still || false
    this.propsTypes = {}
  }

  _prepareSchema (emitter = true) {
    if (!this.schema) {
      return null
    }

    for (let key in this.schema) {
      let prop = this.schema[key]

      if ('type' in prop) {
        this.propsTypes[key] = prop.type
      }

      if ('default' in prop) {
        this.setIfEmpty(key, prop.default)
      }
    }
  }

  // TODO: Criar for para props de setIfEmpty
  async setIfEmpty (key, prop) {
    try {
      const data = await this.get(key)

      if (data !== null) {
        return null
      }
    } catch (err) {
      return err
    }

    this.set({
      [key]: prop
    })
  }

  /**
   * _prepareVirtualProps
   * @description Prepara e atualizad os virual property
   */
  _prepareVirtualProps () {
    if (!this.schema) {
      return null
    }

    for (let key in this.schema) {
      let prop = this.schema[key]

      if (typeof prop.get === 'function') {
        const instance = clone(this)

        // Substitui o this.get para evitar loop infinito
        instance.get = instance._virtualPropGet
        instance.getVirtualProps = instance._virtualPropGetError

        Object.defineProperty(this.virtualProps, key, {
          enumerable: true,
          get: prop.get.bind(instance)
        })

        // Definindo sync para virtual props
        if (prop.listener) {
          this.syncMany(prop.listener, async () => {
            const data = await this.getVirtualProps(key)
            this.emit({ [key]: data })
          })
        }
      }
    }
  }

  _virtualPropGetError (item) {
    throw new Error(`Unable to get virtual properties from a virtual property: ${item}`)
  }

  _virtualPropGet (item) {
    if (this.schema[item] && this.schema[item].get) {
      return this._virtualPropGetError(item)
    }

    return this.getStorageProps(item)
  }

  _prepareMethods () {
    if (this.methods) {
      for (let key in this.methods) {
        if (!( key in this )) {
          this[key] = this.methods[key].bind(this)
        }
      }
    }
  }

  addEventName (name) {
    if (this.eventsNames.indexOf(name) === -1) {
      this.eventsNames.push(name)
    }
  }

  getPrefixName (prop, prefix) {
    const name = prefix
      ? `${prefix}${prop}:${this.type}`
      : `${this.prefixNameEvent}${prop}:${this.type}`
    this.addEventName(name)
    return name
  }

  /**
   * sync
   * @description Sincrozina as propriedades, e executa o callback a cada atualização
   */
  sync (props, getStart = true) {
    for (let key in props) {
      eventEmitter.addListener(this.getPrefixName(key), props[key])
    }

    if (getStart) {
      this.getStorageProps().then(data => {
        for (let key in data) {
          if (key in props) {
            props[key](null, data[key])
          }
        }
      })
    }
  }

  /**
   * syncAll
   * @description Sincrozina todas as propriedades executanto um unico callback
   */
  syncAll (callback) {
    eventEmitter.addListener(this.getPrefixName('all'), callback)
  }

  /**
   * syncMany
   * @description sincroniza um array de objetos retonando em um callback único
   */
  syncMany (objs, callback) {
    let props = {}

    objs.map(key => {
      props[key] = (err, val) => {
        if (err) {
          return callback(err)
        }

        callback(null, { [key]: val })
      }
    })

    this.sync(props)
  }

  /**
   * emit
   * @description Quando sucesso: os emit's são passados em conjunto como objeto
   * @description Quando erro: os emit's são passados individualmente com o erro
   **/
  emit (props, err) {
    if (this.stillEmitter) {
      return null
    }

    eventEmitter.emit(this.getPrefixName('all'), err, props)

    if (err) {
      eventEmitter.emit(this.getPrefixName(props), err)
    } else {
      /**
       * Atualização de virtual props
       * Na atualização de qualquer dado, todas as vp são atualizadas para que
       * o this contenha os dados atuais do Model
       */
      for (let key in props) {
        eventEmitter.emit(this.getPrefixName(key), null, props[key])
      }
    }
  }

  async format (props) {
    let result = {}
    const defaultError = 'Data formatting error'

    for (let key in props) {
      if (this.schema && this.schema[key] && this.schema[key].format) {
        try {
          result[key] = await this.schema[key].format(props[key])
          continue
        } catch (err) {
          this.emit(key, err || defaultError)
          continue
        }
      }

      result[key] = props[key]
    }

    return result
  }

  async validation (props) {
    let result = {}
    const defaultError = 'Invalid data'

    for (let key in props) {
      if (this.schema && this.schema[key] && this.schema[key].validation) {
        try {
          await this.schema[key].validation(props[key])
        } catch (err) {
          this.emit(key, err || defaultError)
          continue
        }
      }

      result[key] = props[key]
    }

    return result
  }

  /**
   * merge
   * @description Mescla novos dados com os dados já salvos
   */
  async merge (props, force = false) {
    if (this.virtualProps) {
      for (let key in props) {
        if (this.virtualProps[key]) {
          throw new Error(`You can not modify a virtual property: ${key}`)
        }
      }
    }

    // Força a execução sem a validação
    if (!force) {
      if (this._findInSchema(props) && this.propsTypes && this.checkPropTypes(props)) {
        props = await this.validation(props)
      }
    }

    if (!props) {
      return true
    }

    // Formata os valores caso a formação esteja configura no schema
    props = await this.format(props)

    const that = this

    try {
      return await new Promise((resolve, reject) => {
        this.storage.mergeItem(that.key, props, (err) => {
          if (err) {
            that.emit(props, err)
            return reject(err)
          }

          that.emit(props)
          resolve(true)
        })
      })
    } catch (err) {
      throw err.message
    }
  }

  _functionName (fun) {
    let ret = fun.toString()
    ret = ret.substr('function '.length)
    ret = ret.substr(0, ret.indexOf('('))
    return ret
  }

  checkPropTypes (props) {
    for (let key in props) {
      let type = typeof props[key]
      let compare = this.propsTypes[key]

      if (compare === 'array') {
        if (!Array.isArray(props[key])) {
          throw new Error(`The ${key} property should be a ${compare}, but it is ${type}`)
        }

        continue
      }

      if (type !== compare) {
        throw new Error(`The ${key} property should be a ${compare}, but it is ${type}`)
      }
    }

    return true
  }

  _findInSchema (props) {
    for (let key in props) {
      if (!this.schema[key]) {
        throw new Error(`The ${key} property does not exist without scheme`)
      }
    }

    return true
  }

  /**
   * set
   * @description Modifica uma propriedade
   */
  async set (props, force = false) {
    if (this.virtualProps) {
      for (let key in props) {
        if (this.virtualProps[key]) {
          throw new Error(`You can not modify a virtual property: ${key}`)
        }
      }
    }

    // Força a execução sem a validação
    if (!force) {
      if (this._findInSchema(props) && this.propsTypes && this.checkPropTypes(props)) {
        props = await this.validation(props)
      }
    }

    if (!props) {
      return true
    }

    // Formata os valores caso a formação esteja configura no schema
    props = await this.format(props)

    const that = this

    try {
      return await new Promise((resolve, reject) => {
        this.storage.setItem(that.key, props, (err) => {
          if (err) {
            that.emit(props, err)
            return reject(err)
          }

          that.emit(props)
          resolve(true)
        })
      })
    } catch (err) {
      throw err.message
    }
  }

  /**
   * still
   * @description Força a não emissão do evento ao modificar uma propriedade
   */
  still () {
    const that = this
    that.stillEmitter = true
    return that
  }

  /**
   * clear
   * @description Limpa toda tabela
   */
  async clear () {
    const exec = await this.storage.removeItem(this.key)
    return exec
  }

  /**
   * remove
   * @description Remove uma propriedade
   */
  async remove (prop) {
    const exec = await this.set({
      [prop]: null
    }, true)

    return exec
  }

  getStorageProps () {
    const that = this

    return new Promise((resolve, reject) => {
      that.storage.getItem(that.key, (err, value) => {
        if (err) {
          return reject(err)
        }

        resolve(value)
      })
    })
  }

  async getVirtualProps (item) {
    if (item) {
      const data = await this.virtualProps[item]
      return data
    }

    let result = {}

    for (let key in this.virtualProps) {
      let prop = await this.virtualProps[key]
      result[key] = prop
    }

    return result
  }

  /**
   * get
   * @description Pega as propriedadades
   */
  async get (item) {
    try {
      if (item) {
        if (item in this.virtualProps) {
          const data = await this.getVirtualProps(item)
          return data
        }

        const dataStorage = await this.getStorageProps()

        if (dataStorage === null || typeof dataStorage[item] === 'undefined') {
          return null
        }

        return dataStorage[item]
      }

      const data = await this.getStorageProps()
      const vProps = await this.getVirtualProps()

      return deepmerge(data, vProps)
    } catch (err) {
      throw err.message
    }
  }

  /**
   * discontinue
   * @description Remove o sincronismo de uma propriedade
   */
  discontinue (name) {
    const index = this.eventsNames.indexOf(name)
    if (index > -1) {
      eventEmitter.removeListener(this.eventsNames.length[index])
    }
  }

  /**
   * discontinueAll
   * @description Remove o sincronismo de todas as propriedades
   */
  discontinueAll () {
    if (this.eventsNames.length > 0) {
      for (let key in this.eventsNames.length) {
        eventEmitter.removeListener(this.eventsNames.length[key])
      }
    }
  }

  destroy (callback) {
    this.discontinueAll()
    return this.clear()
  }
}
