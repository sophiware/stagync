import 'babel-polyfill'
import EventEmitter from 'events'
import deepmerge from 'deepmerge'
import clone from 'clone'
import uuid from 'uuid/v4'
import CreateProp from './CreateProp'

const eventEmitter = new EventEmitter()
let eventsNamesStorage = {
  local: {},
  global: []
}

export default class Storage {
  constructor (config) {
    this._rawConfig = config
    this._setup(config)
  }

  _isReady () {
    if (!this.__ready) {
      return new Promise(resolve => {
        eventEmitter.on(this._localEventReadName, () => resolve())
      })
    }

    return Promise.resolve()
  }

  _setup (config) {
    this._prepareVars(config)
    this._importDriver()
    this._defineProps()
    this._prepareMethods()
    this._prepareVirtualProps()

    this._prepareSchema()

    this._isReady().then(() => {
      if (this.init) {
        this.init()
      }
    })
  }

  createInstance () {
    return new Storage(this._rawConfig)
  }

  scope () {
    return this.createInstance()
  }

  _importDriver () {
    if (!this.config.driver) {
      throw new Error('You need to define a storage for this model. Learn how at https://github.com/sophiware/stagync#storage')
    }

    try {
      const Driver = this.config.driver
      this.driver = new Driver(this)
    } catch (err) {
      throw new Error('An error occurred while trying to load storage', err)
    }
  }

  _prepareVars (config) {
    this.config = config
    this.__ready = false
    this.props = {}
    this.name = config.name
    this.database = config.database
    this.table = config.table
    this.methods = config.methods || null
    this.key = `@${this.database}:${this.table || this.name}`
    this.prefixNameEvent = `${this.key}:`
    this.schema = config.schema || null
    this.uuid = uuid()
    eventsNamesStorage.local[this.uuid] = []
    this.virtualProps = {}
    this._virtualProps = {}
    this.stillEmitter = config.still || false
    this.stillEmitterJustNow = false
    this.propsTypes = {}
    this._localEventReadName = `local:${this.uuid}:isRead`

    if (config.methods.syncErrorHandler) {
      this.syncErrorHandler = config.methods.syncErrorHandler
    } else if (config.syncErrorHandler !== undefined) {
      this.syncErrorHandler = config.syncErrorHandler
    } else {
      this.syncErrorHandler = null
    }
  }

  async _prepareSchema () {
    if (!this.schema) {
      return null
    }

    for (let key in this.schema) {
      let prop = this.schema[key]

      if ('type' in prop) {
        this.propsTypes[key] = prop.type
      }

      if ('default' in prop) {
        await this.setIfEmpty(key, prop.default)
      }
    }

    this.__ready = true
    eventEmitter.emit(this._localEventReadName)
  }

  async setIfEmpty (key, prop) {
    try {
      const data = await this._get(key)

      if (data !== null) {
        return null
      }
    } catch (err) {
      return err
    }

    await this._set({
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
        this._virtualProps[key] = prop
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
        if (!(key in this)) {
          this[key] = this.methods[key].bind(this)
        }
      }
    }
  }

  addEventStorage (name) {
    if (eventsNamesStorage.local[this.uuid].indexOf(name) === -1 && eventsNamesStorage.global.indexOf(name) === -1) {
      eventsNamesStorage.local[this.uuid].push(name)
      eventsNamesStorage.global.push(name)

      return true
    }

    return false
  }

  getEventName (prop, uuid = false) {
    let name = `${this.prefixNameEvent}${prop}`

    if (uuid) {
      name += `:${this.uuid}`
    }

    return name
  }

  addEvent (name, listener) {
    const eventName = this.getEventName(name, true)
    this.addEventStorage(eventName)
    eventEmitter.addListener(eventName, listener)
  }

  getVirtualPropsListeners (name) {
    if (this._virtualProps[name] && this._virtualProps[name].listener) {
      return this._virtualProps[name].listener
    }

    return null
  }

  getAllEventsNames (name) {
    let eventsNames = []

    const prefix = this.getEventName(name, false)
    eventsNamesStorage.global.map(eventName => {
      if (eventName.indexOf(prefix) > -1) {
        eventsNames.push(eventName)
      }
    })

    return eventsNames
  }

  emitEvent (name, ...args) {
    const eventsNames = this.getAllEventsNames(name)
    eventsNames.map(eventName => {
      eventEmitter.emit(eventName, ...args)
    })
  }

  /**
   * sync
   * @description Sincrozina as propriedades, e executa o callback a cada atualização
   */
  sync (props, getStart = true) {
    for (let key in props) {
      this.addEvent(key, props[key])
    }

    if (getStart) {
      this.getStorageProps().then(async (data) => {
        await this._isReady()

        for (let key in data) {
          if (key in props) {
            if (!this.syncErrorHandler) {
              props[key](null, data[key])
            } else {
              props[key](data[key])
            }
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
    this.addEvent('all', callback)
  }

  /**
   * syncMany
   * @description sincroniza um array de objetos retonando em um callback único
   */
  syncMany (objs, callback, getStart = true) {
    let props = {}

    objs.map(key => {
      props[key] = (err, val) => {
        if (err) {
          return callback(err)
        }

        callback(null, { [key]: val })
      }
    })

    this.sync(props, getStart)
  }

  isStill () {
    if (this.stillEmitter) {
      return true
    }

    if (this.stillEmitterJustNow) {
      this.stillEmitterJustNow = false
      return true
    }

    return false
  }

  /**
   * emit
   * @description Quando sucesso: os emit's são passados em conjunto como objeto
   * @description Quando erro: os emit's são passados individualmente com o erro
   **/
  emit (props, err) {
    if (this.isStill()) {
      return null
    }

    if (!this.syncErrorHandler) {
      this.emitEvent('all', err, props)
    } else if (!err) {
      this.emitEvent('all', props)
    }

    if (err && this.syncErrorHandler) {
      this.syncErrorHandler(err)
    } else if (err && !this.syncErrorHandler) {
      this.emitEvent(props, err)
    } else if (!err) {
      /**
       * Atualização de virtual props
       * Na atualização de qualquer dado, todas as vp são atualizadas para que
       * o this contenha os dados atuais do Storage
       */
      for (let key in props) {
        if (!this.syncErrorHandler) {
          this.emitEvent(key, null, props[key])
        } else {
          this.emitEvent(key, props[key])
        }
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
          const response = this.schema[key].validation(props[key])

          if (typeof response === 'boolean' && response === false) {
            throw new Error('Error validation.')
          }

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

  _transform (props) {
    if (!props) {
      return props
    }

    let obj = {}

    Object.keys(props).map(key => {
      obj[key] = {
        _data: props[key]
      }
    })

    return obj
  }

  _resolve (props) {
    if (!props) {
      return props
    }

    let obj = {}

    Object.keys(props).map(key => {
      obj[key] = props[key]._data
    })

    return obj
  }

  set (props, force = false) {
    return this._set(props, force, true)
  }

  /**
   * set
   * @description Modifica uma propriedade
   */
  async _set (props, force = false, awaitReady = false) {
    if (awaitReady) {
      await this._isReady()
    }

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

    props = this._transform(props)

    const that = this

    try {
      return await new Promise((resolve, reject) => {
        this.driver.setItem(that.key, props, (err) => {
          props = that._resolve(props)

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
    this.stillEmitterJustNow = true
    return this
  }

  /**
   * clear
   * @description Limpa toda tabela
   */
  async clear () {
    await this._isReady()
    const exec = await this.driver.removeItem(this.key)
    return exec
  }

  /**
   * remove
   * @description Remove uma propriedade
   */
  async remove (prop) {
    await this._isReady()
    const exec = await this._set({
      [prop]: null
    }, true)

    return exec
  }

  getStorageProps () {
    const that = this

    return new Promise((resolve, reject) => {
      this.driver.getItem(that.key, (err, value) => {
        if (err) {
          return reject(err)
        }

        resolve(that._resolve(value))
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
  get (item) {
    return this._get(item, true)
  }

  async _get (item, awaitReady = false) {
    try {
      if (awaitReady) {
        await this._isReady()
      }

      if (item) {
        if (item in this.virtualProps) {
          const data = await this.getVirtualProps(item)
          return data
        }

        const dataStorage = await this.getStorageProps()

        if (dataStorage === null || dataStorage === undefined || !(item in dataStorage)) {
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
    const eventName = this.getEventName(name, true)
    const index = eventsNamesStorage.local[this.uuid].indexOf(eventName)

    if (index > -1) {
      eventEmitter.removeAllListeners(eventName)
      this.removeByEventNameStorage(eventName)
    }

    return eventName
  }

  async restoreDefaultValues () {
    await this._isReady()

    const keys = Object.keys(this.schema)

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      let prop = this.schema[key]

      if ('default' in prop) {
        await this._set({
          [key]: prop.default
        }, true)
      } else if (!('get' in prop)) {
        await this._set({
          [key]: null
        }, true)
      }
    }
  }

  removeByEventNameStorage (eventName) {
    const localIndex = eventsNamesStorage.local[this.uuid].indexOf(eventName)
    const globalIndex = eventsNamesStorage.global.indexOf(eventName)

    if (localIndex > -1) {
      eventsNamesStorage.local[this.uuid].splice(localIndex, 1)
    }

    if (globalIndex > -1) {
      eventsNamesStorage.global.splice(globalIndex, 1)
    }
  }

  /**
   * discontinueAll
   * @description Remove o sincronismo de todas as propriedades
   */
  discontinueAll () {
    let removed = []

    const local = [...eventsNamesStorage.local[this.uuid]]

    local.map(eventName => {
      eventEmitter.removeAllListeners(eventName)
      removed.push(eventName)
      this.removeByEventNameStorage(eventName)
    })

    return removed
  }

  discontinueGlobalAll () {
    let removed = []

    const global = [...eventsNamesStorage.global]

    global.map(eventName => {
      eventEmitter.removeAllListeners(eventName)
      removed.push(eventName)
      this.removeByEventNameStorage(eventName)
    })

    return removed
  }

  destroy () {
    this.discontinueAll()
    return this.clear()
  }

  _defineProps () {
    for (let key in this.config.schema) {
      this.props[key] = new CreateProp(this, key)
    }
  }
}
