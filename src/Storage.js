const EventEmitter = require('events')
const deepmerge = require('deepmerge')
const merge = typeof deepmerge === 'object' ? deepmerge.default : deepmerge
const clone = require('clone')
const uuid = require('uuid')
const CreateProp = require('./CreateProp')
const Memory = require('./Memory')

const eventEmitter = new EventEmitter()
let eventsNamesStorage = {
  local: {},
  global: []
}

module.exports = class Storage {
  constructor (config) {
    this.memory = new Memory()
    this._rawConfig = config
    this._setup(config)
  }

  _isReady () {
    if (!this.ready) {
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

    this._isReady().then(async () => {
      if (this.init) {
        await this.executeInit()
      }

      if (this._init) {
        this._init()
      }
    })
  }

  executeInit () {
    const init = this.init()

    return new Promise((resolve, reject) => {
      if (!!init && (typeof init === 'object' || typeof init === 'function') && typeof init.then === 'function') {
        init.then(resolve).catch(reject)
      }

      resolve(init)
    })
  }

  createInstance () {
    return new Storage(this._rawConfig)
  }

  scope () {
    return this.createInstance()
  }

  useDrive (action, ...args) {
    if (!this.driver) {
      return this.memory[action](...args)
    }

    return this.driver[action](...args)
  }

  _importDriver () {
    if (!this.config.driver) {
      this.driver = null
      return null
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
    this.ready = false
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

    if (config.methods && config.methods.syncErrorHandler) {
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

    for (const item in this.schema) {
      let prop = this.schema[item]

      if (!('type' in prop)) {
        throw Error('No type in item.')
      }

      this.propsTypes[item] = prop.type
    }

    for (const item in this.schema) {
      let prop = this.schema[item]

      if ('default' in prop) {
        await this.setIfEmpty(item, prop.default)
      }

      await this._syncLocalMemory(item)
    }

    this.ready = true
    eventEmitter.emit(this._localEventReadName)
  }

  async _syncLocalMemory (item) {
    const driveItem = await this.getItemDrive(item)

    this.memory.setItem(this.key, {
      [item]: driveItem
    })
  }

  async setIfEmpty (key, prop) {
    try {
      const data = await this.getItemDrive(key)

      if (data !== null) {
        return null
      }
    } catch (err) {
      return err
    }

    await this.setItemDrive({
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
            const data = this.getVirtualProps(key)
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
      this._isReady().then(() => {
        const data = this.memory.getItem(this.key)

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

  format (props) {
    let result = {}
    const defaultError = 'Data formatting error'

    for (let key in props) {
      if (this.schema && this.schema[key] && this.schema[key].format) {
        try {
          result[key] = this.schema[key].format(props[key])
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

  validation (props) {
    let result = {}
    const defaultError = 'Invalid data'

    for (let key in props) {
      if (this.schema && this.schema[key] && this.schema[key].validation) {
        try {
          const response = this.schema[key].validation(props[key])

          if (typeof response === 'boolean' && response === false) {
            throw new Error('Error validation.')
          }

          this.schema[key].validation(props[key])
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
    for (const key in props) {
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
      obj[key] = props[key]
    })

    return obj
  }

  set (props, force = false) {
    return this.setItemDrive(props, force, true)
  }

  /**
   * set
   * @description Modifica uma propriedade
   */
  setItemDrive (props, force = false, awaitReady = false) {
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
        props = this.validation(props)
      }
    }

    if (!props) {
      return true
    }

    // Formata os valores caso a formação esteja configura no schema
    props = this.format(props)

    props = this._transform(props)

    this.memory.setItem(this.key, props)

    if (!this.driver) {
      if (awaitReady) {
        return new Promise(resolve => {
          this._isReady().then(() => {
            this.emit(props)
            resolve(true)
          })
        })
      }

      this.emit(props)
      return new Promise(resolve => resolve())
    }

    try {
      return new Promise(async (resolve, reject) => {
        if (awaitReady) {
          await this._isReady()
        }

        this.useDrive('setItem', this.key, props, (err) => {
          if (err) {
            this.emit(null, err)
            return reject(err)
          }

          this.emit(props)
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
  clear () {
    this.memory.removeItem(this.key)
    const exec = this.useDrive('removeItem', this.key)
    return exec
  }

  /**
   * remove
   * @description Remove uma propriedade
   */
  async remove (prop) {
    const exec = this.setItemDrive({
      [prop]: null
    }, true)

    return exec
  }

  async getStorageProps () {
    const that = this

    return new Promise((resolve, reject) => {
      that.useDrive('getItem', that.key, (err, value) => {
        if (err) {
          return reject(err)
        }

        resolve(value)
      })
    })
  }

  async getVirtualProps (item) {
    if (item) {
      const data = this.virtualProps[item]
      return data
    }

    let result = {}

    for (let key in this.virtualProps) {
      let prop = this.virtualProps[key]
      result[key] = prop
    }

    return result
  }

  /**
   * get
   * @description Pega as propriedadades
   */
  get (item) {
    const data = this.memory.getItem(this.key)
    return data ? data[item] : undefined
  }

  async getItemDrive (item, awaitReady = false) {
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

      return merge(data, vProps)
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
    const keys = Object.keys(this.schema)

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      let prop = this.schema[key]

      if ('default' in prop) {
        await this.setItemDrive({
          [key]: prop.default
        }, true, true)
      } else if (!('get' in prop)) {
        await this.setItemDrive({
          [key]: null
        }, true, true)
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
