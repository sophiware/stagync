---
layout: default
title: Storages
nav_order: 4
description: "Storages"
has_children: true
---

## Storages 

After [createStorage are created]({{ site.baseurl }}{% link basic-use/basic-use-create-storage.md %}), 
you can import them anywhere in the project to use them. 
To import createStorage, use the createStorage feature, importing straight from Stagync.

```javascript
import { createStorage } from 'stagync'
```

The "createStorage" feature loads all createStorage created with createStorages. We suggest that you always 
extract createStorage for better readability of the code.

```javascript
const { websites, profiles } = createStorage
```

[Next: Storages features]({{ site.baseurl }}{% link createStorage/createStorage-features.md %})

