---
layout: default
title: Methods
nav_order: 3
description: "Methods"
parent: Config
---

{: .no_toc }


## Methods
Methods are additional features you can define in your storage. 
Once defined, you can execute it from `methods`, example: `storageName.methods.youMethod`.

There are some methods that are standard for Stagync, and should be set here.

```javascript
{
    methods: {
        init () {
            console.log(`Hello ${this.name}`)
        },
        myMethod () {
            console.log('My method called!')
        }   
    }
}
```

## Running custom methods
To execute a custom method just call straight from your storage after it is mounted.

```javascript
import { storages } from 'stagync'

storage.websites.methods.myMethod()
```

## Standard Methods
### init
The init method is always executed when storage starts.

### syncErrorHandler
Same as config.syncErrorHandler
