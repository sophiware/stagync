---
layout: default
title: Config
nav_order: 3
description: "Config"
has_children: true
---

## Config

You can set your storage settings in two ways.

The first is directly in `createStorage` the second is `defaultConfig`.
The difference is that when the setting is set in *createStorage*,
it will only fit the scope of that storage. Already when defined
in *defaultConfig*, it will be arrayed globally for all storages
created.

Below you will see a complex example of a storage configuration.

## Example
```javascript
defaultConfig({
  database: 'myDb',
  storage: LocalForage,
  drive: 'localstorage',
  syncErrorHandler (err) {
    console.log(err)
  }   
})

createStorage({
    profiles: {
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
                return 'Assis'
              }
            }
          },
        methods: {
            init(){
                console.log(`Init storage ${this.name}`)
            },
            async getNames(){
              const { nickname, firstName, lastName, fullName } = await this.get()
              return { nickname, firstName, lastName, fullName }
            }
        }
    }
})
```

In the following pages, we will understand the properties passed in the creation of this storage.
