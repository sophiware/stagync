---
layout: default
title: Methods
nav_order: 3
description: "Methods"
parent: Config
---

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
        myMethod (data) {
            console.log(`My method ${data}`)
        }   
    }
}
```

## Running custom methods
To execute a custom method just call straight from your storage after it is mounted.

```javascript
import { storages } from 'stagync'

storage.websites.methods.myMethod('Ok!')
```

## Standard Methods
### init
The init method is always executed when storage starts.

### syncErrorHandler
Same as config.syncErrorHandler

[Next: Storages]({{ site.baseurl }}{% link storages/storages.md %})

