import 'babel-polyfill'
import EventEmitter from 'events'
import merge from 'deepmerge'
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
    this.storage = require(`stagync-storage-${this.type}`)

    if (this.storage.default) {
      this.storage = this.storage.default
    }
  }

  _prepareVars (config) {
    this.tagName = config.tagName || ''
    this.config = config
    this.database = config.database
    this.table = config.table
    this.methods = config.methods || null
    this.key = `@${this.database}:${this.table}`
    this.prefixNameEvent = `${this.key}:`
    this.schema = config.schema || null
    this.type = config.type || 'memory'
    this.eventsNames = []
    this.virtualProps = {}
    this.stillEmitter = config.still || false
    this.currentVirtualProp = null
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
        this.set({
          [key]: prop.default
        }, false, emitter)
      }
    }
  }

  /**
   * Prepara e atualizad os virual property
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
            this.emit({[key]: data})
          })
        }
      }
    }
  }

  _virtualPropGetError (item) {
    throw new Error('Unable to get virtual properties from a virtual property')
  }

  _virtualPropGet (item) {
    if (this.schema[item] && this.schema[item].get) {
      return this._virtualPropGetError()
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

  _setCurrentVirtualProp (prop) {
    this.currentVirtualProp = prop
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
   * Sincrozina as propriedades, e executa o callback a cada atualização
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
    var props = {}

    objs.map(key => {
      props[key] = (err, val) => {
        if (err) {
          return callback(err)
        }

        callback(null, {[key]: val})
      }
    })

    this.sync(props)
  }

  /**
   * Quando sucesso: os emit's são passados em conjunto como objeto
   * Quando erro: os emit's são passados individualmente com o erro
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

  setItemOrMergeItem (result) {
    return result
      ? this.storage.mergeItem
      : this.storage.setItem
  }

  async format (props) {
    var result = {}
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
    var result = {}
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
   * Mescla novos dados com os dados já salvos
   */
  async merge (props, force = false) {
    const current = await this.getStorageProps()
    const data = merge(current || {}, props)
    return this.set(data, force)
  }

  _functionName (fun) {
    var ret = fun.toString()
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
   * Modifica uma propriedade
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
        that.getStorageProps().then((result) => {
          that.setItemOrMergeItem(result)(that.key, JSON.stringify(props), (err) => {
            if (err) {
              that.emit(props, err)
              return reject(err)
            }

            that.emit(props)
            resolve(true)
          })
        }, (err) => {
          that.emit(props, err)
          reject(err)
        })
      })
    } catch (err) {
      throw err.message
    }
  }

  /**
   * Força a não emissão do evento ao modificar uma propriedade
   */
  still () {
    const that = this
    that.stillEmitter = true
    return that
  }

  /**
   * Limpa toda tabela
   */
  async clear (emitter) {
    const exec = await this.storage.removeItem(this.key)
    this._prepareDefaultValues(emitter)
    return exec
  }

  /**
   * Remove uma propriedade
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
      that.storage.getItem(that.key, async (err, value) => {
        if (err) {
          return reject(err)
        }

        if (typeof value === 'string') {
          value = JSON.parse(value)
        } else if (!value) {
          value = {}
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

    var result = {}

    for (let key in this.virtualProps) {
      let prop = await this.virtualProps[key]
      result[key] = prop
    }

    return result
  }
  /**
   * Pega as propriedadades
   */

  async get (item) {
    try {
      if (item) {
        if (item in this.virtualProps) {
          const data = await this.getVirtualProps(item)
          return data
        }

        const dataStorage = await this.getStorageProps()
        return dataStorage[item] || null
      }

      var data = await this.getStorageProps()
      var vProps = await this.getVirtualProps()
      return merge(data, vProps)
    } catch (err) {
      throw err.message
    }
  }

  /**
   * Remove o sincronismo de uma propriedade
   */
  discontinue (name) {
    const index = this.eventsNames.indexOf(name)
    if (index > -1) {
      eventEmitter.removeListener(this.eventsNames.length[index])
    }
  }

  /**
   * Remove o sincronismo de todas as propriedades
   */
  discontinueAll () {
    if (this.eventsNames.length > 0) {
      for (let key in this.eventsNames.length) {
        eventEmitter.removeListener(this.eventsNames.length[key])
      }
    }
  }

  destroy () {
    this.discontinueAll()
    this.clear()
  }
}
