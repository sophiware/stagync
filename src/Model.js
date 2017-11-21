import EventEmitter from 'EventEmitter'
import merge from 'deepmerge'
const eventEmitter = new EventEmitter()

export default class Model {
  constructor (config) {
    this._prepareVars(config)
    this._importStorage()
    this._prepareMethods()
    this._prepareVirtualProps()
    this._prepareDefaultValues()

    // Caso tenha definido init em methods
    if (this.init) {
      this.init()
    }
  }

  _importStorage () {
    this.storage = require(`stagync-storage-${this.type}`)
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
  }

  _prepareDefaultValues (emitter = true) {
    if (!this.schema) {
      return null
    }

    for (let key in this.schema) {
      let prop = this.schema[key]

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
        Object.defineProperty(this.virtualProps, key, {
          enumerable: true,
          get: prop.get.bind(this)
        })
      }
    }
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

  getStorage () {
    return this.storage
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
      this.get().then(data => {
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
    * @description incroniza um alista de objectos retonando em um callback único
  */
  syncMany (obj, callback) {
    var props = {}

    for (let key in obj) {
      props[key] = (err, val) => {
        if (err) {
          return callback(err)
        }

        callback(null, {[key]: val})
      }
    }

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
      ? this.getStorage().mergeItem
      : this.getStorage().setItem
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
    const current = await this.get()
    const data = merge(current || {}, props)
    return this.set(data, force)
  }

  /**
   * Modifica uma propriedade
   */
  async set (props, force = false) {
    if (this.virtualProps) {
      for (let key in props) {
        if (this.virtualProps[key]) {
          return Promise.reject(new Error(`You can not modify a virtual property: ${key}`))
        }
      }
    }
    // Força a execução sem a validação
    if (!force) {
      props = await this.validation(props)
    }

    if (!props) {
      return Promise.resolve(true)
    }
    // Formata os valores caso a formação esteja configura no schema
    props = await this.format(props)

    const that = this

    try {
      return await new Promise((resolve, reject) => {
        that.getStorage().getItem(that.key, (err, result) => {
          if (err) {
            that.emit(props, err)
            return reject(err)
          }

          that.setItemOrMergeItem(result)(that.key, JSON.stringify(props), (err) => {
            if (err) {
              that.emit(props, err)
              return reject(err)
            }

            that.emit(props)
            resolve(true)
          })
        })
      })
    } catch (err) {
      console.warn('Stagync', err)
      return null
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
    const exec = await this.getStorage().removeItem(this.key)
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

  /**
   * Pega as propriedadades
   */
  async get (item, virtualProps = true) {
    const that = this

    try {
      return await new Promise((resolve, reject) => {
        that.getStorage().getItem(that.key, (err, value) => {
          if (err) {
            return reject(err)
          }

          if (typeof value === 'string') {
            value = JSON.parse(value)
          } else if (!value) {
            value = {}
          }

          if (item) {
            return resolve(that.virtualProps[item] || value[item] || null)
          }

          if (virtualProps) {
            value = merge(value, that.virtualProps)
          }

          resolve(value)
        })
      })
    } catch (err) {
      console.log('ERROR', err)
      return null
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
