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

Context is not its own storage method.

```javascript
{
    methods: {
        init () {
            console.log(`Hello ${this.name}`)
        },
        async sendMail (body) {
            const { email } = await this.get()

            request.post('/sendmail', { email, body })
        }
    }
}
```

## Running custom methods
To execute a custom method just call straight from your storage after it is mounted.

```javascript
import { storages } from 'stagync'

storage.websites.methods.sendMail("This is your email.")
```

## Standard Methods
### init
The init method is always executed when storage starts.

### syncErrorHandler
Same as config.syncErrorHandler

[Next: Storages]({{ site.baseurl }}{% link storages/storages.md %})

