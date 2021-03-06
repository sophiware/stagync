---
layout: default
title: Install and import
nav_order: 1
description: "Install and import"
parent: Basic use
---
### Install
Install using npm. Just run `npm install`.
```bash
npm install --save stagync stagync-storage-memory
```

### Import
```javascript
import { defaultConfig, createStorage } from 'stagync'
import Memory from 'stagync-storage-memory'

// or

const { defaultConfig, createStorage }  = require('stagync').default
const Memory = require('stagync-storage-memory').default
```
Initially we need to import stagync and stagync-storage into our application. 
Using stagync-storage is essential. It defines the type of storage you will use for your storage. 
You can find some stagync-createStorage available on the internet or create them yourself. 
To learn more about stagync-storage [click here](#).

Let's use this example stagync-storage Memory, which is capable of storing data in memory, either in an app, website or backend.

[Next: Default setting]({{ site.baseurl }}{% link basic-use/basic-use-default-config.md %})
