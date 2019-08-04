---
layout: default
title: Storages
nav_order: 4
description: "Storages"
has_children: true
---

## Storages 

After [storages are created]({{ site.baseurl }}{% link basic-use/basic-use-create-storage.md %}), 
you can import them anywhere in the project to use them. 
To import storages, use the storages feature, importing straight from Stagync.

```javascript
import { storages } from 'stagync'
```

The "storages" feature loads all storages created with createStorages. We suggest that you always 
extract storages for better readability of the code.

```javascript
const { websites, profiles } = storages
```

[Next: Storages features]({{ site.baseurl }}{% link storage/storage-features.md %})

