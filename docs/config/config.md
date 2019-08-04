---
layout: default
title: Config
nav_order: 3
description: "Config"
has_children: true
---

## Config

```javascript
import { defaultConfig, createStorage } from 'stagync/src'
import LocalForage from 'stagync-storage-localforage'

defaultConfig({
  database: 'sliweb',
  storage: LocalForage,
  drive: 'localstorage',
  syncErrorHandler (err) {
    console.log(err)
  }   
})

createStorage({
  websites: {
    schema: {
      urls: {
        type: 'array',
        default: [
          'http://google.com',
          'http://sophiware.com',
          'http://github.com'
        ]
      },
      time: {
        type: 'number',
        default: 2000
      },
      options: {
        type: 'object',
        default: {
          active: true,
          color: '#010101'
        }
      }
    }
  }
})
```

You can set your storage settings in two ways.

The first is directly in `createStorage` the second is `defaultConfig`.
The difference is that when the setting is set in *createStorage*,
it will only fit the scope of that storage. Already when defined
in *defaultConfig*, it will be arrayed globally for all storages
created.


## Configuration Properties

### data base
string
{: .label }
required
{: .label .label-red }

Define your database.


### name
string
{: .label }
required
{: .label .label-red }

Name of the store.


### table
deprecated
{: .label .label-yellow }

Redundancy of `name`.


### syncErrorHandler
function
{: .label }

Receive read errors or read all data.
By declaring *syncErrorHandler* the handlers of *sync* only
The first to receive the property value, `data => ...`.

```javascript
syncErrorHandler: (err) => {...} 
```

### schemas

Set the properties of your storage.

[Learn more about schemas]({{ site.baseurl }}{% link config/config-schemas.md %})

### methods

Define custom metering for your storage

[Learn more about methods]({{ site.baseurl }}{% link config/config-methods.md %})

