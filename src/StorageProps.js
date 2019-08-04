import Storage from './Storage'

class CreateProp {
  constructor (that, propName) {
    this.that = that
    this.propName = propName

    if (that.propsTypes[propName] !== 'array' && that.propsTypes[propName] !== 'object') {
      delete this.remove
    }
  }

  reset () {
    return this.that.set({
      [this.propName]: this.that.schema[this.propName].default
    })
  }

  get () {
    return this.that.get(this.propName)
  }

  async add (newValue, objectValue) {
    let currentValue = await this.that.get(this.propName)

    if (this.that.propsTypes[this.propName] === 'array') {
      currentValue.push(newValue)
    } else if (this.that.propsTypes[this.propName] === 'object') {
      if (objectValue) {
        currentValue[newValue] = objectValue
      } else {
        currentValue = {...currentValue, ...newValue}
      }
    }

    const response = await this.that.set({
      [this.propName]: currentValue
    })

    return response
  }

  async remove (propOrIndex) {
    if (this.that.propsTypes[this.propName] === 'array' || this.that.propsTypes[this.propName] === 'object') {
      const value = await this.get(this.propName)

      if (this.that.propsTypes[this.propName] === 'array') {
        value.splice(propOrIndex, 1)
      } else {
        delete value[propOrIndex]
      }

      const response = await this.set(value)

      return response
    }
  }

  set (newValue) {
    return this.that.set({[this.propName]: newValue})
  }

  sync (handler) {
    return this.that.sync({
      [this.propName]: handler
    })
  }

  discontinue(){
    return this.that.discontinue(this.propName)
  }
}

export default class StorageProps extends Storage {
  constructor (props) {
    super(props)
    this.defineProps()
  }

  async defineProps () {
    this.props = {}

    for (let key in this.schema) {
      this.props[key] = new CreateProp(this, key)
    }
  }
}
